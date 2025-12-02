# Workflow Stages for Prompt Optimization

## Stage 1: AnalyzeStructure

**Purpose**: Deep analysis against research-backed patterns
**Process**:

1. Read target prompt file
2. Assess prompt type (command, agent, subagent, workflow)
3. Critical analysis against research patterns:
   - Position check: Calculate where critical rules appear
   - Nesting check: Count max XML nesting depth
   - Ratio check: Calculate instruction percentage
   - Repetition check: Find repeated critical rules
4. Calculate component ratios
5. Identify anti-patterns and violations
6. Determine complexity level

## Stage 2: ElevateCriticalRules

**Purpose**: Move critical rules to first 15% of prompt
**Process**:

1. Extract all critical/safety rules from prompt
2. Create <critical_rules> block
3. Position immediately after <role>
4. Assign unique IDs to each rule
5. Replace later occurrences with @rule_id references
6. Verify position percentage <15%

## Stage 3: FlattenNesting

**Purpose**: Reduce nesting depth from 6-7 to 3-4 levels
**Process**:

1. Identify deeply nested sections (>4 levels)
2. Convert nested elements to attributes where possible
3. Extract verbose sections to external references
4. Flatten decision trees using attributes
5. Verify max depth ≤4 levels

## Stage 4: OptimizeInstructionRatio

**Purpose**: Reduce instruction ratio to 40-50% of total prompt
**Process**:

1. Calculate current instruction percentage
2. If >60%, identify verbose sections to extract
3. Create external reference files for detailed content
4. Replace with <references> section
5. Recalculate ratio, target 40-50%

## Stage 5: ConsolidateRepetition

**Purpose**: Implement single source of truth with @references
**Process**:

1. Find all repeated rules/instructions
2. Keep single definition in appropriate section
3. Replace repetitions with @rule_id or @section_id
4. Verify references work correctly
5. Test that enforcement still applies

## Stage 6: AddExplicitPriority

**Purpose**: Create 3-tier priority system for conflict resolution
**Process**:

1. Identify potential conflicts in prompt
2. Create <execution_priority> section
3. Define 3 tiers: Safety/Critical → Core Workflow → Optimization
4. Add conflict_resolution rules
5. Document edge cases with examples

## Stage 7: StandardizeFormatting

**Purpose**: Ensure consistent attribute usage and XML structure
**Process**:

1. Review all XML elements
2. Convert metadata to attributes (id, name, when, required, etc.)
3. Keep content in nested elements
4. Standardize attribute order
5. Verify XML validity

## Stage 8: EnhanceWorkflow

**Purpose**: Transform linear instructions into multi-stage executable workflow
**Routing Logic**:

- Simple prompt: Basic step-by-step with validation checkpoints
- Moderate prompt: Multi-step workflow with decision points
- Complex prompt: Full stage-based workflow with routing intelligence

## Stage 9: ValidateOptimization

**Purpose**: Validate against all research patterns and calculate gains
**Validation Checklist**:

- Critical rules in first 15%
- Max depth ≤4 levels
- Instructions 40-50%
- No rule repeated >2x
- 3-tier priority system exists
- Consistent formatting
- External references for verbose sections

## Stage 10: DeliverOptimized

**Purpose**: Present optimized prompt with detailed analysis
**Output Format**:

- Optimization analysis with before/after metrics
- Research pattern compliance summary
- Scores and improvement calculations
- Key optimizations applied
- Files created (if applicable)
- Implementation notes and testing recommendations
