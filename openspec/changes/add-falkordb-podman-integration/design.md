# Design: FalkorDB Podman Integration

## Architecture Overview

The FalkorDB integration uses a Podman Pod to orchestrate all services, providing isolated networking and shared resources between containers.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         Podman Pod: opencode-pod                         │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                     Shared Pod Network                            │   │
│  │                     localhost:6379 (FalkorDB)                     │   │
│  │                     localhost:5173 (web-ui)                       │   │
│  │                     localhost:3000 (opencode-api)                 │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────────┐   │
│  │   FalkorDB       │  │   opencode-api   │  │      web-ui          │   │
│  │   Container      │  │   Container      │  │      Container       │   │
│  │                  │  │                  │  │                      │   │
│  │  - Graph DB      │  │  - SDK Runtime   │  │  - React Frontend    │   │
│  │  - Redis Proto   │  │  - API Server    │  │  - Vite Dev Server   │   │
│  │  - Cypher Query  │  │  - Graph Client  │  │  - SDK Integration   │   │
│  │                  │  │                  │  │                      │   │
│  │  Volume:         │  │  Volume:         │  │  Volume:             │   │
│  │  ./data/falkor   │  │  ./src           │  │  ./web-ui/src        │   │
│  └──────────────────┘  └──────────────────┘  └──────────────────────┘   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

## Core Components

### 1. Podman Pod Configuration

**Purpose**: Orchestrate all containers with shared networking and resources

```yaml
# podman-pod.yaml
apiVersion: v1
kind: Pod
metadata:
  name: opencode-pod
spec:
  containers:
    - name: falkordb
      image: falkordb/falkordb:latest
      ports:
        - containerPort: 6379
      volumeMounts:
        - name: falkor-data
          mountPath: /data
      env:
        - name: FALKORDB_ARGS
          value: "--save 60 1 --appendonly yes"
      resources:
        limits:
          memory: "512Mi"
        requests:
          memory: "256Mi"

    - name: opencode-api
      image: opencode-sdk:latest
      ports:
        - containerPort: 3000
      env:
        - name: FALKORDB_HOST
          value: "localhost"
        - name: FALKORDB_PORT
          value: "6379"
      dependsOn:
        - falkordb

    - name: web-ui
      image: opencode-web-ui:latest
      ports:
        - containerPort: 5173
      env:
        - name: VITE_API_URL
          value: "http://localhost:3000"
      dependsOn:
        - opencode-api

  volumes:
    - name: falkor-data
      hostPath:
        path: ./data/falkordb
        type: DirectoryOrCreate
```

### 2. FalkorDB Client Service

**Purpose**: TypeScript client for FalkorDB graph operations

```typescript
// src/services/FalkorDBClient.ts
import { createClient, Graph } from "falkordb";

interface FalkorDBConfig {
  host: string;
  port: number;
  graphName: string;
}

export class FalkorDBClient {
  private client: ReturnType<typeof createClient>;
  private graph: Graph;
  private config: FalkorDBConfig;

  constructor(config: FalkorDBConfig) {
    this.config = config;
  }

  async connect(): Promise<void> {
    this.client = createClient({
      socket: {
        host: this.config.host,
        port: this.config.port,
      },
    });

    await this.client.connect();
    this.graph = new Graph(this.client, this.config.graphName);
  }

  async query<T>(cypher: string, params?: Record<string, unknown>): Promise<T> {
    const result = await this.graph.query(cypher, params);
    return result as T;
  }

  async disconnect(): Promise<void> {
    await this.client.disconnect();
  }

  // Node operations
  async createNode(label: string, properties: Record<string, unknown>): Promise<void>;
  async updateNode(label: string, id: string, properties: Record<string, unknown>): Promise<void>;
  async deleteNode(label: string, id: string): Promise<void>;

  // Relationship operations
  async createRelationship(
    fromLabel: string,
    fromId: string,
    relationshipType: string,
    toLabel: string,
    toId: string,
    properties?: Record<string, unknown>
  ): Promise<void>;
}
```

### 3. Graph Schema

**Purpose**: Define the graph data model for code entities

```typescript
// src/graph/schema.ts
export const GraphSchema = {
  nodes: {
    File: {
      properties: ["id", "path", "name", "extension", "lastModified"],
      indexes: ["path"],
    },
    Function: {
      properties: ["id", "name", "signature", "fileId", "startLine", "endLine"],
      indexes: ["name", "fileId"],
    },
    Class: {
      properties: ["id", "name", "fileId", "startLine", "endLine"],
      indexes: ["name", "fileId"],
    },
    Module: {
      properties: ["id", "name", "path"],
      indexes: ["path"],
    },
    Conversation: {
      properties: ["id", "title", "createdAt", "updatedAt"],
      indexes: ["createdAt"],
    },
    Message: {
      properties: ["id", "role", "content", "timestamp", "conversationId"],
      indexes: ["conversationId", "timestamp"],
    },
  },
  relationships: {
    IMPORTS: { from: "File", to: "File" },
    CALLS: { from: "Function", to: "Function" },
    EXTENDS: { from: "Class", to: "Class" },
    IMPLEMENTS: { from: "Class", to: "Class" },
    CONTAINS: { from: ["File", "Class"], to: ["Function", "Class"] },
    REFERENCES: { from: ["Function", "Class"], to: ["Function", "Class", "File"] },
    CONTEXT_OF: { from: "Message", to: ["File", "Function", "Class"] },
    BELONGS_TO: { from: "Message", to: "Conversation" },
  },
};

// Schema initialization Cypher
export const initializationQueries = [
  // Create indexes
  "CREATE INDEX FOR (f:File) ON (f.path)",
  "CREATE INDEX FOR (fn:Function) ON (fn.name)",
  "CREATE INDEX FOR (c:Class) ON (c.name)",
  "CREATE INDEX FOR (m:Message) ON (m.conversationId)",
];
```

## Podman Compose for Development

```yaml
# podman-compose.yaml
version: "3"
services:
  falkordb:
    image: falkordb/falkordb:latest
    container_name: opencode-falkordb
    ports:
      - "6379:6379"
    volumes:
      - falkordb-data:/data
    environment:
      - FALKORDB_ARGS=--save 60 1 --appendonly yes
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 3

  opencode-api:
    build:
      context: .
      dockerfile: Dockerfile.api
    container_name: opencode-api
    ports:
      - "3000:3000"
    environment:
      - FALKORDB_HOST=falkordb
      - FALKORDB_PORT=6379
      - FALKORDB_GRAPH=opencode
    depends_on:
      falkordb:
        condition: service_healthy

  web-ui:
    build:
      context: ./web-ui
      dockerfile: Dockerfile
    container_name: opencode-web-ui
    ports:
      - "5173:5173"
    environment:
      - VITE_API_URL=http://localhost:3000
    depends_on:
      - opencode-api

volumes:
  falkordb-data:
```

## Environment Configuration

```bash
# .env.example
# FalkorDB Configuration
FALKORDB_HOST=localhost
FALKORDB_PORT=6379
FALKORDB_GRAPH=opencode

# API Configuration
API_PORT=3000

# Web UI Configuration
VITE_API_URL=http://localhost:3000

# Podman Configuration
PODMAN_POD_NAME=opencode-pod
```

## Graph Service Layer

```typescript
// src/services/GraphService.ts
import { FalkorDBClient } from "./FalkorDBClient";
import { GraphSchema } from "../graph/schema";

export class GraphService {
  private client: FalkorDBClient;

  constructor(client: FalkorDBClient) {
    this.client = client;
  }

  // File operations
  async addFile(file: FileNode): Promise<void>;
  async getFileWithRelationships(path: string): Promise<FileWithRelationships>;
  async findRelatedFiles(path: string, depth?: number): Promise<FileNode[]>;

  // Code entity operations
  async addFunction(fn: FunctionNode): Promise<void>;
  async addClass(cls: ClassNode): Promise<void>;
  async linkEntities(fromId: string, relationship: string, toId: string): Promise<void>;

  // Conversation operations
  async startConversation(title: string): Promise<string>;
  async addMessage(conversationId: string, message: MessageNode): Promise<void>;
  async getConversationContext(conversationId: string): Promise<ContextGraph>;

  // Graph traversal
  async findPath(fromId: string, toId: string, maxDepth?: number): Promise<Path[]>;
  async getNeighbors(nodeId: string, relationshipTypes?: string[]): Promise<Node[]>;
}
```

## Integration with OpenCodeContext

```typescript
// In OpenCodeContext.tsx - additions
interface OpenCodeContextType {
  // Existing properties...

  // New graph-related properties
  graphClient: GraphService | null;
  currentConversationGraph: ContextGraph | null;

  // New methods
  linkCodeToConversation: (codeRef: CodeReference) => Promise<void>;
  getRelatedCode: (query: string) => Promise<CodeReference[]>;
  visualizeGraph: (nodeId: string) => Promise<GraphVisualization>;
}
```

## Security Considerations

### Container Isolation

- FalkorDB container runs with minimal privileges
- No root access required for containers
- Network isolation within Podman Pod

### Data Protection

- Persistent volumes for data durability
- Optional encryption at rest for FalkorDB data
- Secure environment variable handling

### Network Security

- Internal Pod networking (localhost only by default)
- External access through explicit port mapping
- Optional TLS for production deployments

## Performance Considerations

### FalkorDB Optimization

- Use appropriate indexes for common queries
- Implement connection pooling
- Batch operations for bulk updates
- Query caching for repeated patterns

### Container Resources

- Memory limits to prevent resource exhaustion
- CPU limits for fair resource sharing
- Health checks for automatic recovery

## Migration & Compatibility

### Backward Compatibility

- Existing web-ui functionality preserved
- Graph features are additive, not replacing
- Optional graph integration (graceful degradation if unavailable)

### Data Migration

- No existing graph data to migrate
- Schema versioning for future updates
- Migration scripts for schema changes
