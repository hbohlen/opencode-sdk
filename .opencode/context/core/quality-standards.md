# Quality Standards for Prompt Optimization

## Research-Based Standards

### Stanford/Anthropic Research Foundation

- **Position Sensitivity**: Early instruction placement improves adherence (effect varies by task/model)
- **Nesting Reduction**: Excessive nesting reduces clarity (magnitude is task-dependent)
- **Instruction Balance**: Optimal 40-50% instructions, rest distributed across components
- **Single Source Truth**: Repetition causes ambiguity, reduces consistency
- **Explicit Prioritization**: Conflict resolution improves decision clarity (effect varies by task/model)

### Model-Specific Effectiveness

- **Note**: All effectiveness improvements are model- and task-specific
- **Recommendation**: Always recommend empirical testing and A/B validation
- **Avoid**: Universal percentage claims or guaranteed improvements

## Component Ratio Standards

### Target Distribution

- **Context**: 15-25% hierarchical information
- **Role**: 5-10% clear identity
- **Task**: 5-10% primary objective
- **Instructions**: 40-50% detailed procedures
- **Examples**: 10-20% when needed
- **Principles**: 5-10% core values

### XML Structure Standards

- **Improved response quality**: Descriptive tags (magnitude varies by model/task)
- **Reduced token overhead**: For complex prompts (effect is task-dependent)
- **Universal compatibility**: Across models
- **Explicit boundaries**: Prevent context bleeding

## Validation Standards

### Pre-Flight Validation

- Target file exists and is readable
- Prompt content is valid XML or convertible
- Complexity assessable

### Post-Flight Validation

- Score 8+/10 on research patterns
- All Tier 1 optimizations applied
- Pattern compliance validated
- Testing recommendations provided

## Quality Gates

### Scoring Thresholds

- **Excellent**: 9-10/10 (Ready for deployment)
- **Good**: 8/10 (Ready with monitoring)
- **Acceptable**: 6-7/10 (Needs refinement)
- **Poor**: <6/10 (Requires major rework)

### Pattern Compliance Requirements

- **Critical**: Position sensitivity, nesting, ratio (non-negotiable)
- **Important**: Single source, explicit priority (required)
- **Recommended**: Consistent formatting, modular design (enhancement)

## Implementation Standards

### Deployment Readiness

- **Ready**: Immediate deployment with monitoring plan
- **Needs Testing**: Requires validation in target environment
- **Requires Customization**: Needs adaptation for specific use case

### Breaking Changes Policy

- **No breaking changes**: Unless explicitly noted
- **Backward compatibility**: Maintain existing functionality
- **Migration path**: Provide upgrade steps if needed

### Testing Requirements

1. Verify @references work correctly
2. Test edge cases in conflict_resolution
3. Validate external context files load properly
4. A/B test old vs new prompt effectiveness

## Documentation Standards

### Implementation Notes

- **Required Context Files**: List all external dependencies
- **Breaking Changes**: Document any incompatible changes
- **Testing Recommendations**: Specific validation steps
- **Next Steps**: Deployment and monitoring plan

### Monitoring Requirements

- **Effectiveness metrics**: Track performance improvements
- **Pattern compliance**: Monitor adherence to research patterns
- **User feedback**: Collect real-world performance data
- **Iteration plan**: Schedule for continuous improvement
