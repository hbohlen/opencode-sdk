# Design: Zep Graphiti Memory Layer Integration

## Architecture Overview

The Zep Graphiti integration adds a comprehensive memory layer that captures, organizes, and retrieves knowledge from coding sessions to enhance AI-assisted development.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          OpenCode Application                            │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                     OpenCodeContext Enhanced                      │   │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐   │   │
│  │  │ Conversation    │  │ Memory          │  │ Code            │   │   │
│  │  │ Handler         │  │ Manager         │  │ Context         │   │   │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────┘   │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                    │                                     │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                     Memory Service Layer                          │   │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐   │   │
│  │  │ GraphitiClient  │  │ EntityExtractor │  │ MemoryQuery     │   │   │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────┘   │   │
│  │                                                                   │   │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐   │   │
│  │  │ Episode         │  │ Entity          │  │ Fact            │   │   │
│  │  │ Manager         │  │ Manager         │  │ Manager         │   │   │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────┘   │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                    │                                     │
└────────────────────────────────────┼─────────────────────────────────────┘
                                     │
                    ┌────────────────┴────────────────┐
                    │                                 │
           ┌────────────────────┐          ┌────────────────────┐
           │  Zep Cloud API     │          │  Self-Hosted       │
           │  (graphiti.cloud)  │    OR    │  Graphiti + Neo4j  │
           └────────────────────┘          └────────────────────┘
```

## Core Components

### 1. Graphiti Client

**Purpose**: TypeScript client for Zep Graphiti API communication

```typescript
// src/services/GraphitiClient.ts
import { Graphiti, Episode, Entity, Edge } from "@getzep/graphiti-js";

interface GraphitiConfig {
  apiKey?: string; // For cloud
  baseUrl?: string; // For self-hosted
  graphId: string;
}

export class GraphitiClient {
  private client: Graphiti;
  private config: GraphitiConfig;

  constructor(config: GraphitiConfig) {
    this.config = config;
    this.client = new Graphiti({
      apiKey: config.apiKey,
      baseUrl: config.baseUrl || "https://api.graphiti.cloud",
    });
  }

  // Episode operations
  async createEpisode(metadata: EpisodeMetadata): Promise<Episode>;
  async addMessageToEpisode(episodeId: string, message: Message): Promise<void>;
  async closeEpisode(episodeId: string): Promise<Episode>;

  // Entity operations
  async createEntity(entity: EntityInput): Promise<Entity>;
  async updateEntity(entityId: string, updates: Partial<EntityInput>): Promise<Entity>;
  async searchEntities(query: string, limit?: number): Promise<Entity[]>;

  // Edge operations
  async createEdge(edge: EdgeInput): Promise<Edge>;
  async getRelatedEntities(entityId: string, edgeTypes?: string[]): Promise<Entity[]>;

  // Search operations
  async semanticSearch(query: string, options?: SearchOptions): Promise<SearchResult[]>;
  async temporalSearch(query: string, timeRange: TimeRange): Promise<SearchResult[]>;
}
```

### 2. Memory Graph Schema

**Purpose**: Define entity and edge types for code-centric memory

```typescript
// src/memory/schema.ts

// Entity Types
export interface CodePatternEntity {
  type: "CodePattern";
  name: string;
  description: string;
  language?: string;
  examples: string[];
  frequency: number; // How often observed
  lastSeen: Date;
}

export interface DecisionEntity {
  type: "Decision";
  summary: string;
  rationale: string;
  alternatives?: string[];
  context: string;
  confidence: number; // 0-1
  madeAt: Date;
}

export interface PreferenceEntity {
  type: "Preference";
  category: "style" | "architecture" | "tooling" | "workflow";
  preference: string;
  strength: number; // 0-1, how consistently expressed
  evidence: string[]; // Message IDs where expressed
}

export interface ContextEntity {
  type: "Context";
  projectId?: string;
  filePath?: string;
  codeSnippet?: string;
  description: string;
  relevance: number;
}

// Edge Types
export type EdgeType =
  | "LED_TO" // One decision led to another
  | "RELATES_TO" // General relationship
  | "CONTRADICTS" // Conflicting decisions/patterns
  | "REPLACES" // Newer version replaces older
  | "DEPENDS_ON" // Dependency relationship
  | "USED_IN"; // Pattern/decision used in context

export interface MemoryEdge {
  type: EdgeType;
  sourceId: string;
  targetId: string;
  weight: number;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}
```

### 3. Entity Extraction Pipeline

**Purpose**: Extract structured entities from conversation messages

```typescript
// src/memory/EntityExtractor.ts

export class EntityExtractor {
  private openaiClient: OpenAI;
  private extractionPrompt: string;

  constructor(openaiConfig: OpenAIConfig) {
    this.openaiClient = new OpenAI(openaiConfig);
    this.extractionPrompt = ENTITY_EXTRACTION_PROMPT;
  }

  // Sanitize message content to prevent prompt injection attacks
  private sanitizeContent(content: string): string {
    // Remove potential instruction injection patterns
    // Limit length to prevent token abuse
    const maxLength = 4000;
    let sanitized = content.slice(0, maxLength);
    // Escape common prompt injection patterns
    sanitized = sanitized.replace(/```system/gi, '```code_block');
    sanitized = sanitized.replace(/\[INST\]/gi, '[CONTENT]');
    return sanitized;
  }

  async extractEntities(message: Message): Promise<ExtractedEntities> {
    // Sanitize message content to prevent prompt injection attacks
    const sanitizedContent = this.sanitizeContent(message.content);
    
    // Use OpenAI to identify entities in message
    const response = await this.openaiClient.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: this.extractionPrompt },
        { role: "user", content: sanitizedContent },
      ],
      response_format: { type: "json_object" },
    });

    return this.parseExtractionResponse(response);
  }

  async extractDecisions(messages: Message[]): Promise<DecisionEntity[]>;
  async extractPatterns(messages: Message[]): Promise<CodePatternEntity[]>;
  async extractPreferences(messages: Message[]): Promise<PreferenceEntity[]>;
  async extractCodeReferences(message: Message): Promise<ContextEntity[]>;
}

const ENTITY_EXTRACTION_PROMPT = `
You are an expert at extracting structured information from coding conversations.
Extract the following entity types:

1. Decisions: Technical choices made during the conversation
2. Patterns: Coding patterns, best practices, or conventions discussed
3. Preferences: User preferences for coding style, tools, or approaches
4. Code References: Specific code files, functions, or concepts mentioned

Output as JSON with the following structure:
{
  "decisions": [...],
  "patterns": [...],
  "preferences": [...],
  "codeReferences": [...]
}
`;
```

### 4. Memory Query Service

**Purpose**: Query memory graph for relevant context

```typescript
// src/memory/MemoryService.ts

export class MemoryService {
  private graphitiClient: GraphitiClient;
  private entityExtractor: EntityExtractor;

  constructor(graphitiClient: GraphitiClient, entityExtractor: EntityExtractor) {
    this.graphitiClient = graphitiClient;
    this.entityExtractor = entityExtractor;
  }

  // Ingest new content into memory
  async ingestMessage(sessionId: string, message: Message): Promise<void> {
    // 1. Extract entities from message
    const entities = await this.entityExtractor.extractEntities(message);

    // 2. Add message to current episode
    await this.graphitiClient.addMessageToEpisode(sessionId, message);

    // 3. Create/update entities in graph using batch operations for performance
    const allEntities = entities.all();
    if (allEntities.length > 0) {
      // Use Promise.all for parallel processing of entity upserts
      await Promise.all(allEntities.map(entity => this.upsertEntity(entity)));
    }

    // 4. Create edges between related entities
    await this.createRelationshipEdges(entities);
  }

  // Retrieve relevant memories for context
  async getRelevantMemories(query: string, options?: MemoryQueryOptions): Promise<Memory[]> {
    const results = await this.graphitiClient.semanticSearch(query, {
      limit: options?.limit || 10,
      entityTypes: options?.entityTypes,
      timeRange: options?.timeRange,
    });

    return this.rankByRelevance(results, query);
  }

  // Build memory-augmented context for prompts
  async buildMemoryContext(currentMessage: string, maxTokens?: number): Promise<string> {
    const memories = await this.getRelevantMemories(currentMessage);
    return this.formatMemoriesForPrompt(memories, maxTokens || 2000);
  }

  // Get temporal view of decisions
  async getDecisionHistory(topic: string): Promise<DecisionTimeline> {
    const decisions = await this.graphitiClient.temporalSearch(topic, {
      entityTypes: ["Decision"],
    });
    return this.buildTimeline(decisions);
  }
}
```

### 5. Episode Management

**Purpose**: Manage coding sessions as discrete episodes

```typescript
// src/memory/EpisodeManager.ts

export class EpisodeManager {
  private graphitiClient: GraphitiClient;
  private activeEpisodes: Map<string, Episode>;

  constructor(graphitiClient: GraphitiClient) {
    this.graphitiClient = graphitiClient;
    this.activeEpisodes = new Map();
  }

  async startSession(metadata: SessionMetadata): Promise<string> {
    const episode = await this.graphitiClient.createEpisode({
      name: `Session ${new Date().toISOString()}`,
      metadata: {
        ...metadata,
        startedAt: new Date(),
      },
    });

    this.activeEpisodes.set(episode.id, episode);
    return episode.id;
  }

  async endSession(sessionId: string): Promise<EpisodeSummary> {
    const episode = await this.graphitiClient.closeEpisode(sessionId);
    this.activeEpisodes.delete(sessionId);

    return {
      id: episode.id,
      messageCount: episode.messageCount,
      entitiesExtracted: episode.entityCount,
      duration: episode.duration,
    };
  }

  async addMessage(sessionId: string, message: Message): Promise<void> {
    await this.graphitiClient.addMessageToEpisode(sessionId, message);
  }
}
```

## OpenCodeContext Integration

```typescript
// In OpenCodeContext.tsx - additions
interface OpenCodeContextType {
  // Existing properties...

  // New memory-related properties
  memoryService: MemoryService | null;
  currentSessionId: string | null;
  memoryEnabled: boolean;

  // New methods
  startMemorySession: () => Promise<void>;
  endMemorySession: () => Promise<void>;
  getMemoryContext: (query: string) => Promise<Memory[]>;
  searchMemories: (query: string) => Promise<SearchResult[]>;
  toggleMemory: (enabled: boolean) => void;
}

// Enhanced message handling with memory
const handleSendMessage = async (content: string) => {
  // 1. Get relevant memories for context
  const memoryContext = await memoryService.buildMemoryContext(content);

  // 2. Build enhanced prompt with memory
  const enhancedPrompt = buildPromptWithMemory(content, memoryContext);

  // 3. Send to OpenCode
  const response = await opencodeSdk.chat(enhancedPrompt);

  // 4. Ingest interaction into memory
  await memoryService.ingestMessage(currentSessionId, {
    role: "user",
    content,
  });
  await memoryService.ingestMessage(currentSessionId, {
    role: "assistant",
    content: response,
  });

  return response;
};
```

## UI Components

### Memory Panel

```typescript
// src/components/MemoryPanel.tsx
interface MemoryPanelProps {
  onSearch: (query: string) => void;
  memories: Memory[];
  isLoading: boolean;
}

// Features:
// - Search bar for semantic memory search
// - List of relevant memories with entity type icons
// - Expandable detail view for each memory
// - Timeline view toggle
// - Memory settings access
```

### Memory Visualization

```typescript
// src/components/MemoryGraph.tsx
interface MemoryGraphProps {
  centerEntity: Entity;
  relatedEntities: Entity[];
  edges: Edge[];
  onEntityClick: (entity: Entity) => void;
}

// Features:
// - D3.js or React Flow based graph visualization
// - Entity nodes with type-specific styling
// - Edge labels showing relationship types
// - Interactive exploration (click to expand)
// - Temporal filtering
```

## Configuration

```typescript
// src/config/memory.ts
export interface MemoryConfig {
  // Graphiti connection
  graphiti: {
    type: "cloud" | "self-hosted";
    apiKey?: string; // Cloud
    baseUrl?: string; // Self-hosted
    graphId: string;
  };

  // Entity extraction
  extraction: {
    enabled: boolean;
    openaiApiKey: string;
    model: string;
  };

  // Memory behavior
  behavior: {
    autoIngest: boolean;
    maxContextTokens: number;
    relevanceThreshold: number;
  };
}

// Environment variables
// GRAPHITI_API_KEY=your-api-key
// GRAPHITI_BASE_URL=https://your-graphiti-instance.com (for self-hosted)
// GRAPHITI_GRAPH_ID=opencode-memory
// OPENAI_API_KEY=your-openai-key
```

## Self-Hosted Deployment

For self-hosted Graphiti, the following services are required:

```yaml
# docker-compose.graphiti.yaml
version: "3"
services:
  neo4j:
    image: neo4j:5.15
    environment:
      - NEO4J_AUTH=neo4j/your-password
      - NEO4J_PLUGINS=["apoc"]
    ports:
      - "7474:7474"
      - "7687:7687"
    volumes:
      - neo4j-data:/data

  graphiti:
    image: getzep/graphiti:latest
    environment:
      - NEO4J_URI=bolt://neo4j:7687
      - NEO4J_USER=neo4j
      - NEO4J_PASSWORD=your-password
      - OPENAI_API_KEY=${OPENAI_API_KEY}
    ports:
      - "8000:8000"
    depends_on:
      - neo4j

volumes:
  neo4j-data:
```

## Security Considerations

### API Key Protection

- Store API keys in environment variables
- Never expose keys in client-side code
- **GraphitiClient runs server-side only**: The GraphitiClient class is designed to run exclusively on the backend/API layer, not in browser contexts
- For web-ui integrations, use a server-side API endpoint that proxies requests to Graphiti
- API keys are injected via server-side environment variables and never sent to the client

### Data Privacy

- User can control what gets ingested
- Ability to delete specific memories
- Session-level privacy controls

### Network Security

- TLS for all API communication
- Rate limiting for API calls
- Request validation and sanitization

## Performance Considerations

### Latency Optimization

- Async entity extraction (non-blocking)
- Memory caching for frequent queries
- Batch operations for bulk updates

### Token Management

- Limit memory context to configurable token budget
- Prioritize recent and relevant memories
- Summarize older memories to save tokens

## Integration with FalkorDB

When both FalkorDB and Graphiti are deployed:

```typescript
// src/services/UnifiedGraphService.ts
export class UnifiedGraphService {
  private falkorDB: FalkorDBClient; // Code structure
  private graphiti: GraphitiClient; // Conversation memory

  async getEnhancedContext(query: string): Promise<EnhancedContext> {
    // 1. Get code relationships from FalkorDB
    const codeContext = await this.falkorDB.getRelatedCode(query);

    // 2. Get conversation memories from Graphiti
    const memories = await this.graphiti.semanticSearch(query);

    // 3. Merge and rank results
    return this.mergeContexts(codeContext, memories);
  }
}
```

This design ensures that the Zep Graphiti integration provides a powerful memory layer that complements the existing code structure analysis while maintaining flexibility for cloud or self-hosted deployments.
