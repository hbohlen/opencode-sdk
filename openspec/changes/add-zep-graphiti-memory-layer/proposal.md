# Change: Add Zep Graphiti SDK Integration for Comprehensive Memory Layer

## Why

AI coding assistants benefit significantly from persistent memory that goes beyond simple conversation history. Zep Graphiti provides a sophisticated knowledge graph-based memory system that enables:

1. **Temporal Knowledge Graphs**: Track how code understanding evolves over time
2. **Entity Extraction**: Automatically identify and link code concepts, patterns, and decisions
3. **Episodic Memory**: Remember specific coding sessions, decisions, and their contexts
4. **Semantic Search**: Find relevant past context using natural language queries
5. **Fact Relationships**: Build a connected knowledge graph of project-specific information

By integrating Zep Graphiti, the opencode-sdk gains a comprehensive memory layer that improves code assistance quality over time through accumulated project knowledge.

## What Changes

### Core Graphiti Integration

- Add Zep Graphiti SDK dependency for TypeScript
- Create Graphiti client abstraction layer
- Implement memory graph initialization and configuration
- Support both cloud-hosted and self-hosted Graphiti instances

### Memory Graph Schema

- Define entity types for code concepts: CodePattern, Decision, Preference, Context
- Define edges: LED_TO, RELATES_TO, CONTRADICTS, REPLACES
- Implement episode management for coding sessions
- Support temporal queries for understanding evolution

### Entity Extraction Pipeline

- Implement automatic entity extraction from conversations
- Extract code references, decisions, and preferences
- Link entities to existing knowledge graph nodes
- Update entity weights and relationships over time

### Memory Query Interface

- Add semantic search across memory graph
- Support temporal queries (what did we decide about X on date Y)
- Implement context window optimization using memory relevance
- Create memory-augmented prompt generation

### Integration with OpenCode Context

- Extend OpenCodeContext with memory capabilities
- Add memory retrieval to conversation handling
- Implement memory-aware code suggestions
- Create memory visualization components

**BREAKING**: New dependency on Zep Graphiti service; requires configuration for cloud or self-hosted instance

## Impact

- Affected specs: web-ui (memory integration), conversation-handling (memory-augmented)
- Affected code: OpenCodeContext.tsx, conversation handlers, new memory service modules
- New components: GraphitiClient, MemoryService, EntityExtractor, MemoryVisualizer
- New dependencies: @getzep/graphiti-js, Zep cloud service or self-hosted Graphiti
- Infrastructure: Optional Graphiti server for self-hosted deployments

## Prerequisites

- Zep Graphiti account (cloud) or self-hosted Graphiti instance
- Neo4j database (for self-hosted Graphiti)
- OpenAI API key (for entity extraction)

## Relationship to FalkorDB Proposal

This proposal complements the FalkorDB integration:
- **FalkorDB**: Focuses on code structure relationships (imports, calls, inheritance)
- **Zep Graphiti**: Focuses on conversation memory and temporal knowledge
- Both can coexist, serving different purposes in the knowledge architecture
