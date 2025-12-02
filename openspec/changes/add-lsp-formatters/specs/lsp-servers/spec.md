# Spec: LSP Server Additions

## ADDED Requirements

### Requirement: Support for Bash shell scripting

The system SHALL provide autocompletion, syntax highlighting, go-to-definition, and parameter hints for `.sh`, `.bash`, or `.zsh` files.

#### Scenario: Shell scripting development

User creates a new shell script file and expects the LSP to provide intelligent code completion and error detection.

#### Configuration

`bash-language-server` via `npx -y bash-language-server --stdio`

### Requirement: Support for Fish shell scripting

The system SHALL provide autocompletion, syntax highlighting, go-to-definition, and parameter hints for Fish-specific commands in `.fish` files.

#### Scenario: Fish shell development

User creates a new Fish script file and expects the LSP to provide intelligent code completion and error detection for Fish syntax.

#### Configuration

`fish-lsp` via `fish-lsp --stdio`

### Requirement: Support for XML configuration files

The system SHALL provide XML schema validation, autocompletion, syntax highlighting, and error detection for `.xml`, `.xsd`, or `.xslt` files.

#### Scenario: XML configuration development

User creates or edits XML configuration files and expects the LSP to provide schema validation and intelligent completion.

#### Configuration

`lemminx` via `lemminx`

### Requirement: Support for TailwindCSS development

The system SHALL provide autocompletion, syntax highlighting, go-to-definition, and hover documentation for TailwindCSS classes in CSS/HTML files.

#### Scenario: TailwindCSS development

User creates or edits CSS/HTML files with TailwindCSS classes and expects intelligent class name completion and documentation.

#### Configuration

`tailwindcss-language-server` via `npx -y tailwindcss-language-server --stdio`

### Requirement: Support for GitLab CI configuration

The system SHALL provide schema validation, autocompletion, syntax highlighting, and error detection for GitLab CI YAML in `.gitlab-ci.yml` files.

#### Scenario: GitLab CI pipeline development

User creates or edits GitLab CI pipeline files and expects schema validation and intelligent completion for GitLab CI syntax.

#### Configuration

`gitlab-ci-localization-server` via `npx -y gitlab-ci-localization-server --stdio`

### Requirement: Support for GitHub Actions workflows

The system SHALL provide schema validation, autocompletion, syntax highlighting, and error detection for GitHub Actions YAML in `.github/workflows/*.yml` files.

#### Scenario: GitHub Actions workflow development

User creates or edits GitHub Actions workflow files and expects schema validation and intelligent completion for GitHub Actions syntax.

#### Configuration

`github-actions-language-server` via `npx -y github-actions-language-server --stdio`

### Requirement: Support for Git configuration files

The system SHALL provide syntax highlighting, pattern validation, autocompletion, and error detection for `.gitignore`, `.gitattributes`, `.gitmodules` files.

#### Scenario: Git configuration management

User creates or edits Git configuration files and expects syntax validation and intelligent pattern completion.

#### Configuration

`git-language-server` via `npx -y git-language-server --stdio`

### Requirement: Alternative Nix LSP support

The system SHALL provide autocompletion, syntax highlighting, go-to-definition, and error detection for `.nix` files using NixD as an alternative to nil.

#### Scenario: Nix development with alternative LSP

User prefers NixD over nil LSP for Nix development and expects equivalent functionality with potentially better performance or features.

#### Configuration

`nixd` via `nixd --stdio`

### Requirement: Support for OpenTofu infrastructure

The system SHALL provide autocompletion, syntax highlighting, go-to-definition, and provider documentation for OpenTofu in `.tf`, `.tfvars` files.

#### Scenario: OpenTofu infrastructure development

User creates or edits OpenTofu configuration files and expects intelligent completion and documentation for OpenTofu resources.

#### Configuration

`terraform-ls` via `terraform-ls init`

### Requirement: Support for container files

The system SHALL provide autocompletion, syntax highlighting, go-to-definition, and Dockerfile linting for `Dockerfile`, `Containerfile`, or `*.dockerfile` files.

#### Scenario: Container configuration development

User creates or edits Dockerfile and expects intelligent completion for Docker instructions and best practices validation.

#### Configuration

`dockerfile-language-server-nodejs` via `npx -y dockerfile-language-server-nodejs --stdio`

### Requirement: Support for Oxide language

The system SHALL provide autocompletion, syntax highlighting, go-to-definition, and Oxide-specific development features for `.ox` files.

#### Scenario: Oxide language development

User creates or edits Oxide language files and expects intelligent code completion and error detection for Oxide syntax.

#### Configuration

`oxc` via `oxc lsp`

### Requirement: Support for Lua formatting (enhance existing LSP)

The system SHALL provide consistent code formatting, customizable rules, and integration with existing `lua-ls` for `.lua` files.

#### Scenario: Lua code formatting

User wants to format Lua files with proper indentation, spacing, and Lua-specific formatting rules while maintaining compatibility with existing lua-ls.

#### Configuration

`lua-format` via `lua-format -c` or `stylua` via `stylua`

### Requirement: Support for Go formatting (enhance existing LSP)

The system SHALL provide consistent code formatting, integration with existing `gopls`, and support for Go modules for `.go` files.

#### Scenario: Go code formatting

User wants to format Go files with proper import organization and Go-specific formatting rules while maintaining compatibility with existing gopls.

#### Configuration

`gofmt` via `gofmt -w` or `goimports` via `goimports -w`

## Configuration Details

Each LSP server requires:

- `command`: Array of command and arguments
- `disabled`: Boolean (default: false)
- `env`: Environment variables object (default: {})
- `extensions`: Array of file extensions
- `initialization`: Initialization options object (default: {})

File extensions mapping:

- Bash: `[".sh", ".bash", ".zsh"]`
- Fish: `[".fish"]`
- XML: `[".xml", ".xsd", ".xslt"]`
- TailwindCSS: `[".css", ".html"]`
- GitLab CI: `[".gitlab-ci.yml", ".gitlab-ci.yaml"]`
- GitHub Actions: `[".github/workflows/*.yml", ".github/workflows/*.yaml"]`
- Git: `[".gitignore", ".gitattributes", ".gitmodules"]`
- NixD: `[".nix"]`
- OpenTofu: `[".tf", ".tfvars"]`
- Podman/Dockerfile: `["Dockerfile", "Containerfile", "*.dockerfile"]`
- Oxide: `[".ox"]`
