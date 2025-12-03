# Change Proposal: Add LSP and Formatters

## Summary

Add comprehensive Language Server Protocol (LSP) servers and code formatters to the OpenCode configuration to support development across multiple programming languages, shell scripting, and configuration files.

## Motivation

The current OpenCode configuration covers basic LSP servers and formatters for Python, JavaScript/TypeScript, Rust, Go, Lua, JSON/JSONC, and Nix. However, it lacks support for many popular languages and tools that users commonly work with, including shell scripting (fish, bash), configuration files (XML, TailwindCSS, GitLab CI, GitHub Actions), containerization (Podman/Dockerfile), infrastructure (OpenTofu), and version control (Git).

## Scope

This change will add LSP servers and formatters for:

### Already Covered (Current State)

- Python: `pyright` + `ruff`
- JavaScript/TypeScript: `typescript-language-server` + `prettier`
- Rust: `rust-analyzer` + `rustfmt`
- Go: `gopls` (LSP only)
- Lua: `lua-ls` (LSP only)
- JSON/JSONC: `vscode-json-languageserver`
- Nix: `nil`

### To Be Added

1. **Bash**: LSP server and formatter
2. **Fish Shell**: LSP server and formatter
3. **XML**: LSP server and formatter
4. **TailwindCSS**: LSP and formatter
5. **GitLab CI**: LSP and formatter
6. **GitHub Actions**: LSP and formatter
7. **Git**: LSP and formatter
8. **Lua**: Formatter (LSP already configured)
9. **OpenTofu**: LSP and formatter
10. **Podman/Dockerfile**: LSP and formatter
11. **NixD**: Alternative LSP (in addition to `nil`)
12. **Oxide Language**: LSP and formatter

## Implementation Strategy

1. Research and identify the most widely-used LSP servers and formatters for each language/tool
2. Add LSP server configurations to the `lsp` section
3. Add formatter configurations to the `formatter` section
4. Ensure proper file extension mappings
5. Configure appropriate installation commands
6. Validate the configuration

## Risks and Considerations

- Some tools may require specific system dependencies or package managers
- Multiple tools for the same language may cause conflicts
- User systems may not have all tools installed
- Some languages may have multiple LSP options, requiring selection of the most maintained/reliable option

## Why

### Enhanced Developer Experience

Adding comprehensive LSP servers and formatters significantly improves the developer experience by providing:

- **Intelligent Code Completion**: Autocompletion for functions, classes, keywords, and file paths
- **Real-time Error Detection**: Immediate feedback on syntax and semantic errors
- **Go-to-Definition**: Quick navigation to function/class definitions and declarations
- **Hover Documentation**: Inline documentation and parameter hints
- **Consistent Formatting**: Automated code formatting for better readability and team consistency

### Cross-Language Support

Modern development involves multiple languages and tools:

- **Shell Scripts**: Bash and Fish for automation and system administration
- **Configuration Files**: XML, YAML (GitLab CI, GitHub Actions), and Git configurations
- **Web Development**: TailwindCSS for rapid UI development
- **Infrastructure**: OpenTofu/Terraform for Infrastructure as Code
- **Containerization**: Dockerfile and Containerfile for modern deployment workflows
- **Emerging Languages**: Oxide language support for cutting-edge development

### Productivity Benefits

- **Reduced Context Switching**: Native support for multiple languages without external tool setup
- **Automated Code Quality**: Consistent formatting reduces code review overhead
- **Faster Development**: LSP features like autocomplete and error detection speed up coding
- **Better Collaboration**: Standardized formatting improves team code consistency

### Toolchain Integration

The proposed LSP servers and formatters integrate seamlessly with the existing OpenCode setup:

- **Prettier Integration**: Extends existing Prettier configuration for new languages
- **NPM Package Management**: Uses the established Node.js ecosystem for JavaScript-based tools
- **System Package Support**: Handles cross-platform compatibility for system-level tools
- **Fish Shell Scripts**: Native support for the project's shell environment

## Success Criteria

- All requested languages/tools have LSP server support
- All requested languages/tools have formatter support (where applicable)
- Configuration is validated and syntactically correct
- File extension mappings are comprehensive
- Commands are appropriate for cross-platform compatibility
