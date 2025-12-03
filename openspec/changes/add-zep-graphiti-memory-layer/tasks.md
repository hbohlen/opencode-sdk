# Tasks: Add Zep Graphiti SDK Integration for Memory Layer

## BLOCKERS

This proposal requires external services and infrastructure that are not currently available:

1. **Zep Graphiti Service Required**: Requires either Zep Cloud account or self-hosted Graphiti instance
2. **Neo4j Required for Self-Hosted**: Self-hosted Graphiti requires Neo4j database
3. **OpenAI API Key Required**: Entity extraction uses OpenAI for processing
4. **Backend Server Required**: GraphitiClient must run server-side (API keys cannot be exposed to browser)
5. **Security Concerns**: Prompt injection prevention in entity extraction needs careful implementation

## Prerequisites Not Met

- [ ] Zep Graphiti account (cloud) or self-hosted Graphiti instance
- [ ] Neo4j database (for self-hosted Graphiti)
- [ ] OpenAI API key (for entity extraction)
- [ ] Backend API server implementation

---

## 1. Graphiti SDK Setup

- [ ] 1.1 Add @getzep/graphiti-js npm package dependency
  - **BLOCKER**: Requires backend server - GraphitiClient cannot run in browser
- [ ] 1.2 Create GraphitiClient service class
  - **SECURITY**: API keys must be stored server-side only
- [ ] 1.3 Implement connection management (cloud and self-hosted)
- [ ] 1.4 Add authentication handling for Zep API
  - **BLOCKER**: Requires Zep API key
- [ ] 1.5 Create TypeScript types for Graphiti operations

## 2. Memory Graph Schema

- [ ] 2.1 Design entity types for code concepts
- [ ] 2.2 Define CodePattern entity with properties
- [ ] 2.3 Define Decision entity with rationale tracking
- [ ] 2.4 Define Preference entity for user preferences
- [ ] 2.5 Define Context entity for session context
- [ ] 2.6 Define edge types (LED_TO, RELATES_TO, CONTRADICTS, REPLACES)
- [ ] 2.7 Create schema initialization utilities

## 3. Episode Management

- [ ] 3.1 Implement episode creation for coding sessions
- [ ] 3.2 Add message ingestion to episodes
- [ ] 3.3 Create episode completion handling
- [ ] 3.4 Implement episode metadata tracking
- [ ] 3.5 Add episode search and retrieval

## 4. Entity Extraction Pipeline

- [ ] 4.1 Create EntityExtractor service
  - **BLOCKER**: Requires OpenAI API key
  - **SECURITY**: Must implement comprehensive prompt injection prevention:
    - Use allowlist-based input validation (reject suspicious patterns)
    - Use parameterized prompts with explicit variable binding
    - Implement output sanitization before storing extracted entities
    - Apply rate limiting to prevent abuse
    - Log and monitor extraction attempts for anomalies
- [ ] 4.2 Implement code reference extraction
- [ ] 4.3 Add decision extraction from conversations
- [ ] 4.4 Implement preference detection
- [ ] 4.5 Add context extraction utilities
- [ ] 4.6 Configure OpenAI integration for entity extraction

## 5. Memory Query Interface

- [ ] 5.1 Create MemoryService abstraction
  - **BLOCKER**: Depends on Graphiti connection
- [ ] 5.2 Implement semantic search across memory graph
- [ ] 5.3 Add temporal query support
- [ ] 5.4 Create context window optimization
- [ ] 5.5 Implement memory-augmented prompt generation
- [ ] 5.6 Add relevance scoring for retrieved memories

## 6. OpenCodeContext Integration

- [ ] 6.1 Extend OpenCodeContext with memory state
  - **BLOCKER**: Requires backend API to proxy memory operations
- [ ] 6.2 Add memory retrieval to conversation flow
- [ ] 6.3 Implement automatic memory updates on message
- [ ] 6.4 Add memory-aware context building
- [ ] 6.5 Create hooks for memory operations

## 7. UI Components

- [ ] 7.1 Create MemoryPanel component
  - **BLOCKER**: Requires memory API to be functional
- [ ] 7.2 Implement memory search interface
- [ ] 7.3 Add memory visualization (graph view)
  - **TODO**: Choose visualization library (D3.js, React Flow, etc.)
- [ ] 7.4 Create entity detail views
- [ ] 7.5 Implement memory timeline view
- [ ] 7.6 Add memory settings configuration

## 8. Configuration & Environment

- [ ] 8.1 Add environment variables for Graphiti connection
- [ ] 8.2 Create configuration validation
- [ ] 8.3 Support cloud vs self-hosted configuration
- [ ] 8.4 Document API key requirements
- [ ] 8.5 Add feature flags for memory features

## 9. Testing & Validation

- [ ] 9.1 Create unit tests for GraphitiClient
  - **BLOCKER**: No test framework configured
- [ ] 9.2 Add integration tests for memory operations
  - **BLOCKER**: Requires Graphiti service access
- [ ] 9.3 Test entity extraction accuracy
- [ ] 9.4 Validate memory retrieval relevance
- [ ] 9.5 Performance testing for memory queries
- [ ] 9.6 Test graceful degradation when Graphiti unavailable

## 10. Documentation

- [ ] 10.1 Document Graphiti setup instructions
- [ ] 10.2 Create memory schema documentation
- [ ] 10.3 Write API documentation for memory services
- [ ] 10.4 Add user guide for memory features
- [ ] 10.5 Create troubleshooting guide
- [ ] 10.6 Document self-hosted deployment

## Dependencies

- Task 1 must complete before Tasks 2-5 (SDK required for all operations)
- Task 2 must complete before Tasks 3-4 (schema required for entities)
- Tasks 3-4 can run in parallel after Task 2
- Task 5 depends on Tasks 3-4 (memory operations need entities and episodes)
- Task 6 depends on Task 5 (context needs memory service)
- Task 7 depends on Task 6 (UI needs context integration)
- Task 8 can run in parallel with Tasks 2-7
- Task 9 depends on Tasks 1-7 (all components needed for testing)
- Task 10 can start after Task 1 and continue throughout

## Next Steps to Unblock

1. **Create Backend Server**: Implement Node.js/Express backend to host GraphitiClient
2. **Obtain Zep Account**: Sign up for Zep Cloud or set up self-hosted Graphiti
3. **Obtain OpenAI API Key**: Required for entity extraction
4. **Add Test Framework**: Configure testing for memory services
5. **Security Review**: Implement prompt injection prevention in EntityExtractor

## Relationship to Other Proposals

This proposal complements:
- **add-falkordb-podman-integration**: FalkorDB handles code structure, Graphiti handles conversation memory
- **add-valkey-caching**: Valkey caches memory query results for faster retrieval
- **add-observability-stack**: Memory operations can be traced with Langfuse/Langsmith
