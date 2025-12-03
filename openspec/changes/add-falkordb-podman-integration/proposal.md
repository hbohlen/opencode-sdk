# Change: Add FalkorDB SDK GraphDB in Podman Container

## Why

The opencode-sdk and web-ui currently lack a persistent graph database for storing and querying relationships between code entities, conversations, and knowledge. FalkorDB is a high-performance graph database that is Redis-compatible and optimized for knowledge graphs and AI applications. By containerizing FalkorDB alongside the opencode.ai and web-ui components in a Podman Pod, we enable:

1. Semantic relationship tracking between code entities
2. Context-aware code navigation and understanding
3. Persistent knowledge graphs for AI-assisted development
4. Unified container orchestration for the entire stack

## What Changes

### Core Podman Pod Architecture

- Create a Podman Pod configuration that includes:
  - FalkorDB graph database container
  - opencode.ai backend service container
  - web-ui frontend container
- Define shared networking within the Pod
- Configure persistent volumes for FalkorDB data
- Add health checks and restart policies

### FalkorDB SDK Integration

- Add FalkorDB SDK dependency for Node.js/TypeScript
- Create GraphDB client abstraction layer
- Implement connection management and pooling
- Add graph schema for code entities and relationships
- Support Cypher query language for graph operations

### Graph Data Model

- Define node types: File, Function, Class, Module, Conversation, Message
- Define relationship types: IMPORTS, CALLS, EXTENDS, REFERENCES, CONTEXT_OF
- Implement graph traversal utilities
- Add indexing for common query patterns

### Configuration & Management

- Environment variable configuration for FalkorDB connection
- Podman Compose file for development setup
- Production deployment configuration
- Database migration and initialization scripts

**BREAKING**: New container orchestration approach; requires Podman installation for local development

## Impact

- Affected specs: web-ui (graph integration), infrastructure (new Podman pod configuration)
- Affected code: OpenCodeContext.tsx, new graph client modules, container configurations
- New components: FalkorDBClient, GraphSchema, PodmanPod configuration
- New dependencies: falkordb (Node.js SDK), Podman container runtime
- Infrastructure: Podman Pod with FalkorDB, opencode.ai, and web-ui containers

## Prerequisites

- Podman installed on the host system
- Node.js 18+ for FalkorDB SDK
- Sufficient resources for running containerized services (min 2GB RAM recommended)
