# Validation Patterns for Prompt Optimization

## Position Validation

**Check**: Critical rules positioned in first 15% of prompt
**Method**:

1. Find first critical instruction
2. Calculate position percentage
3. Flag if >15% (CRITICAL VIOLATION)
   **Target**: <15% position

## Nesting Validation

**Check**: Maximum XML nesting depth ≤4 levels
**Method**:

1. Count max XML nesting depth
2. Flag if >4 levels (MAJOR VIOLATION)
   **Target**: ≤4 levels

## Ratio Validation

**Check**: Instruction ratio 40-50% of total prompt
**Method**:

1. Calculate instruction percentage
2. Flag if >60% (VIOLATION) or <40% (suboptimal)
   **Target**: 40-50%

## Repetition Validation

**Check**: Critical rules defined once, referenced thereafter
**Method**:

1. Find repeated critical rules
2. Flag if same rule appears 3+ times (VIOLATION)
   **Target**: 1x definition + @references

## Priority Validation

**Check**: Explicit priority system exists
**Method**:

1. Verify 3-tier priority system
2. Check conflict resolution rules
3. Validate edge case documentation
   **Target**: Complete priority hierarchy

## Formatting Validation

**Check**: Consistent XML formatting with attributes
**Method**:

1. Verify metadata in attributes
2. Check content in elements
3. Validate attribute order consistency
   **Target**: Standardized format

## Modular Design Validation

**Check**: External references for verbose sections
**Method**:

1. Identify extracted content
2. Verify reference files exist
3. Check @reference syntax
   **Target**: Modular structure

## Scoring Criteria

- Critical position: 3 points (HIGHEST WEIGHT)
- Nesting depth: 2 points
- Instruction ratio: 2 points
- Single source: 1 point
- Explicit priority: 1 point
- Modular design: 1 point
  **Total**: 10 points maximum

## Quality Gates

- **Pass**: 8+/10 points
- **Review**: 6-7/10 points
- **Fail**: <6/10 points
