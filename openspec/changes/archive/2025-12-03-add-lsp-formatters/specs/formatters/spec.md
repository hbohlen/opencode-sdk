# Spec: Formatter Additions

## ADDED Requirements

### Requirement: Format Bash shell scripts

The system SHALL provide consistent indentation, proper spacing, and shell-specific formatting rules for `.sh`, `.bash`, or `.zsh` files.

#### Scenario: Shell script formatting

User wants to format shell scripts with consistent indentation, proper spacing around operators, and shell-specific formatting rules.

#### Configuration

`shfmt` via `shfmt -w $FILE`

### Requirement: Format Fish shell scripts

The system SHALL provide consistent indentation, proper function formatting, and Fish-specific syntax formatting for `.fish` files.

#### Scenario: Fish script formatting

User wants to format Fish shell scripts with consistent indentation using spaces and proper function formatting.

#### Configuration

`fish_indent` via `fish_indent $FILE`

### Requirement: Format XML configuration files

The system SHALL provide consistent indentation, proper XML element formatting, and attribute alignment for `.xml`, `.xsd`, or `.xslt` files.

#### Scenario: XML configuration formatting

User wants to format XML files with consistent indentation, proper element formatting, and attribute alignment.

#### Configuration

`xmllint` via `xmllint --format --output $FILE $FILE`

### Requirement: Format TailwindCSS files

The system SHALL provide consistent class name ordering, proper spacing, and TailwindCSS-specific formatting rules for CSS/HTML files with TailwindCSS.

#### Scenario: TailwindCSS formatting

User wants to format CSS/HTML files with TailwindCSS classes with consistent class ordering and proper spacing.

#### Configuration

`prettier` with TailwindCSS plugin via `prettier --write $FILE`

### Requirement: Format GitLab CI configurations

The system SHALL provide consistent YAML formatting, proper indentation, and GitLab CI-specific formatting rules for `.gitlab-ci.yml` files.

#### Scenario: GitLab CI formatting

User wants to format GitLab CI pipeline files with consistent YAML formatting and proper job definition indentation.

#### Configuration

`prettier` via `prettier --parser yaml --write $FILE`

### Requirement: Format GitHub Actions workflows

The system SHALL provide consistent YAML formatting, proper indentation, and GitHub Actions-specific formatting rules for `.github/workflows/*.yml` files.

#### Scenario: GitHub Actions formatting

User wants to format GitHub Actions workflow files with consistent YAML formatting and proper job definition indentation.

#### Configuration

`prettier` via `prettier --parser yaml --write $FILE`

### Requirement: Format Git configuration files

The system SHALL provide consistent pattern formatting, proper comment handling, and pattern validation for `.gitignore`, `.gitattributes`, `.gitmodules` files.

#### Scenario: Git configuration formatting

User wants to validate and format Git configuration files with consistent patterns and proper comment handling.

#### Configuration

No specific formatter needed (typically not formatted)

### Requirement: Format Lua files (enhance existing LSP)

The system SHALL provide consistent code formatting, Lua-specific rules, and integration with existing lua-ls for `.lua` files.

#### Scenario: Lua code formatting

User wants to format Lua files with proper indentation, Lua-specific formatting rules, and support for multiple Lua versions.

#### Configuration

`stylua` via `stylua --config-path - $FILE` or `lua-format` via `lua-format -c`

### Requirement: Format Go files (enhance existing LSP)

The system SHALL provide consistent code formatting following Go standards, import organization, and integration with existing `gopls` for `.go` files.

#### Scenario: Go code formatting

User wants to format Go files with proper import organization, Go-specific formatting rules, and standard Go formatting conventions.

#### Configuration

`goimports` via `goimports -w $FILE` (or use existing go_fmt formatter)

### Requirement: Format OpenTofu/Terraform files

The system SHALL provide consistent HCL formatting, proper indentation, and OpenTofu/Terraform-specific formatting rules for `.tf`, `.tfvars` files.

#### Scenario: OpenTofu/Terraform formatting

User wants to format OpenTofu/Terraform files with consistent HCL formatting and proper indentation for resource definitions.

#### Configuration

`terraform fmt` via `terraform fmt -write $FILE`

### Requirement: Format container files

The system SHALL provide consistent Dockerfile instruction formatting and proper ARG/ENV formatting for `Dockerfile`, `Containerfile`, or `*.dockerfile` files.

#### Scenario: Dockerfile formatting

User wants to format container files with consistent Dockerfile instruction formatting and proper handling of multi-stage builds.

#### Configuration

`dockerfile-formatter` via `dockerfile-formatter --inplace $FILE`

### Requirement: Format Oxide language files

The system SHALL provide consistent Oxide language formatting, proper indentation, and integration with oxide-language-server for `.ox` files.

#### Scenario: Oxide language formatting

User wants to format Oxide language files with consistent formatting rules and proper indentation.

#### Configuration

`ox fmt` via `ox fmt $FILE`

### Requirement: Format Nix files with alejandra (enhance existing)

The system SHALL provide consistent Nix expression formatting, enhanced configuration, and better LSP integration for `.nix` files using alejandra.

#### Scenario: Enhanced Nix formatting

User wants enhanced alejandra configuration with better integration and customizable formatting rules.

#### Configuration

`alejandra` via `alejandra --check $FILE`

## Configuration Details

Each formatter requires:

- `command`: Array of command and arguments with `$FILE` placeholder
- `environment`: Environment variables object (default: {})
- `extensions`: Array of file extensions
- `disabled`: Boolean (default: false)

File extensions mapping:

- Bash: `[".sh", ".bash", ".zsh"]`
- Fish: `[".fish"]`
- XML: `[".xml", ".xsd", ".xslt"]`
- TailwindCSS: `[".css", ".html"]`
- GitLab CI: `[".gitlab-ci.yml", ".gitlab-ci.yaml"]`
- GitHub Actions: `[".github/workflows/*.yml", ".github/workflows/*.yaml"]`
- Git: `[".gitignore", ".gitattributes", ".gitmodules"]` (no formatter needed)
- Lua: `[".lua"]`
- Go: `[".go"]`
- OpenTofu: `[".tf", ".tfvars"]`
- Podman/Dockerfile: `["Dockerfile", "Containerfile", "*.dockerfile"]`
- Oxide: `[".ox"]`
- Nix: `[".nix"]` (enhance existing alejandra)

## Environment Considerations

Some formatters may require specific environment variables:

- `NODE_ENV`: development for Node.js-based formatters
- `PATH`: Ensure tool binaries are accessible
- `HOME`: Some tools use home directory for configuration
