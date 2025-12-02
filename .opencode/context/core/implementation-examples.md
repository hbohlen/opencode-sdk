# Implementation Examples for Prompt Optimization

## Before/After Examples

### Nesting Reduction

**Before** (6 levels):

```xml
<instructions>
  <workflow_execution>
    <stage>
      <process>
        <research_validation>
          <position_check>
            - Condition here
```

**After** (3 levels):

```xml
<stage validate="@position_check"
       when="condition"
       category="validation"/>
```

### Repetition Consolidation

**Before** (repeated 3x):

```
"Critical rules must appear in first 15%"
"Critical rules must appear in first 15%"
"Critical rules must appear in first 15%"
```

**After** (1x definition + references):

```xml
<critical_rules>
  <rule id="position_sensitivity">Critical rules in first 15%</rule>
</critical_rules>

<!-- Later references -->
<stage enforce="@critical_rules.position_sensitivity">
<path enforce="@critical_rules.position_sensitivity">
```

### Instruction Ratio Optimization

**Before** (65% instructions):

- Verbose workflow details embedded
- Long examples in main prompt
- Detailed specifications inline

**After** (45% instructions):

- Core instructions only
- Details extracted to references
- Examples in external files

### Attribute Standardization

**Before**:

```xml
<stage>
  <name>AnalyzeStructure</name>
  <priority>HIGHEST</priority>
  <action>Deep analysis</action>
```

**After**:

```xml
<stage id="analyze_structure"
       name="AnalyzeStructure"
       priority="HIGHEST">
  <action>Deep analysis</action>
```

## Reference Syntax Examples

### Rule References

```xml
<definition>
  <critical_rules>
    <rule id="approval_gate">ALWAYS request approval before execution</rule>
  </critical_rules>
</definition>

<usage>
  <stage enforce="@critical_rules.approval_gate">
  <path enforce="@critical_rules.approval_gate">
  <principles>
    <safe enforce="@critical_rules">
</usage>
```

### Section References

```xml
<workflow stages="@workflow_stages.optimization"/>
<validation patterns="@validation_patterns.research"/>
<examples ref="@implementation_examples.patterns"/>
```

## Conflict Resolution Examples

### Priority System

```xml
<execution_priority>
  <tier level="1" desc="Safety & Critical Rules">
    - Critical rules from <critical_rules>
    - Safety gates and approvals
  </tier>
  <tier level="2" desc="Core Workflow">
    - Primary workflow stages
    - Delegation decisions
  </tier>
  <tier level="3" desc="Optimization">
    - Performance enhancements
    - Context management
  </tier>
  <conflict_resolution>
    Tier 1 always overrides Tier 2/3

    Edge cases:
    - Safety vs Performance: Safety takes precedence
    - Speed vs Accuracy: Accuracy takes precedence
  </conflict_resolution>
</execution_priority>
```

## Testing Examples

### Reference Validation

```xml
<!-- Test that @references resolve -->
<test>
  <verify>@critical_rules.position_sensitivity exists</verify>
  <verify>@workflow_stages.optimization loads</verify>
  <verify>@validation_patterns.research accessible</verify>
</test>
```

### Edge Case Testing

```xml
<edge_cases>
  <case>Empty prompt input</case>
  <case>Malformed XML input</case>
  <case>Missing critical rules</case>
  <case>Conflicting priorities</case>
</edge_cases>
```
