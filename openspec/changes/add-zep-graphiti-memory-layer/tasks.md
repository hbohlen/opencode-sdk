# Tasks: Add Zep Graphiti SDK Integration for Memory Layer

## 1. Graphiti SDK Setup

- [ ] 1.1 Add @getzep/graphiti-js npm package dependency
- [ ] 1.2 Create GraphitiClient service class
- [ ] 1.3 Implement connection management (cloud and self-hosted)
- [ ] 1.4 Add authentication handling for Zep API
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
- [ ] 4.2 Implement code reference extraction
- [ ] 4.3 Add decision extraction from conversations
- [ ] 4.4 Implement preference detection
- [ ] 4.5 Add context extraction utilities
- [ ] 4.6 Configure OpenAI integration for entity extraction

## 5. Memory Query Interface

- [ ] 5.1 Create MemoryService abstraction
- [ ] 5.2 Implement semantic search across memory graph
- [ ] 5.3 Add temporal query support
- [ ] 5.4 Create context window optimization
- [ ] 5.5 Implement memory-augmented prompt generation
- [ ] 5.6 Add relevance scoring for retrieved memories

## 6. OpenCodeContext Integration

- [ ] 6.1 Extend OpenCodeContext with memory state
- [ ] 6.2 Add memory retrieval to conversation flow
- [ ] 6.3 Implement automatic memory updates on message
- [ ] 6.4 Add memory-aware context building
- [ ] 6.5 Create hooks for memory operations

## 7. UI Components

- [ ] 7.1 Create MemoryPanel component
- [ ] 7.2 Implement memory search interface
- [ ] 7.3 Add memory visualization (graph view)
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
- [ ] 9.2 Add integration tests for memory operations
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
