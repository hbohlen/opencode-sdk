# Design: LSP and Formatters Configuration

## Architecture

The LSP and formatter configuration follows the existing pattern in `opencode.jsonc`:

- **LSP Section**: Contains language server configurations with `command`, `disabled`, `env`, `extensions`, and `initialization` fields
- **Formatter Section**: Contains formatter configurations with `command`, `environment`, and `extensions` fields

## Tool Selection Criteria

1. **Active Maintenance**: Tools must be actively maintained with recent updates
2. **Community Adoption**: Prefer widely-used, community-standard tools
3. **Cross-Platform**: Commands should work on Linux, macOS, and Windows
4. **Integration Quality**: Well-documented, easy to install, minimal dependencies
5. **Performance**: Reasonable startup time and resource usage

## Configuration Patterns

### LSP Server Configuration Pattern

```json
"LANGUAGE_NAME": {
  "command": ["executable", "--flags"],
  "disabled": false,
  "env": {},
  "extensions": [".ext", ".other"],
  "initialization": {}
}
```

### Formatter Configuration Pattern

```json
"LANGUAGE_NAME": {
  "disabled": false,
  "command": ["executable", "--flags", "$FILE"],
  "environment": {},
  "extensions": [".ext", ".other"]
}
```

## Tool Selection Rationale

### Bash

- **LSP**: bash-language-server (npm package, TypeScript implementation)
- **Formatter**: shfmt (Go-based, widely adopted)

### Fish Shell

- **LSP**: fish-lsp (TypeScript implementation by Nick Donfris)
- **Formatter**: fish_indent (built-in with Fish)

### XML

- **LSP**: lemminx (Java-based, Eclipse XML Language Server)
- **Formatter**: xmllint or xmlformat (system tools)

### TailwindCSS

- **LSP**: Tailwind CSS IntelliSense (VS Code extension, also available as LSP)
- **Formatter**: Prettier with TailwindCSS plugin

### GitLab CI

- **LSP**: GitLab YAML Language Server (TypeScript implementation)
- **Formatter**: Prettier with YAML support

### GitHub Actions

- **LSP**: VS Code GitHub Actions extension (TypeScript implementation)
- **Formatter**: Prettier with YAML support

### Git

- **LSP**: git-lens or Git Language Server (TypeScript implementations)
- **Formatter**: No specific formatter needed (typically auto-generated)

### Lua

- **LSP**: Already configured (lua-ls)
- **Formatter**: lua-format (Lua-based formatter)

### OpenTofu

- **LSP**: terraform-ls (HashiCorp tool supporting OpenTofu)
- **Formatter**: terraform fmt (HashiCorp tool)

### Podman/Dockerfile

- **LSP**: docker-language-server (Go implementation by Docker)
- **Formatter**: dockerfile-formatter or prettier plugin

### NixD

- **LSP**: nixd (C++ implementation by nix-community)
- **Formatter**: alejandra (already configured for Nix)

### Oxide Language

- **LSP**: oxide-language-server (Rust implementation)
- **Formatter**: ox fmt (built-in Oxide tool)

## File Extension Mappings

- Bash: `.sh`, `.bash`, `.zsh`
- Fish: `.fish`
- XML: `.xml`, `.xsd`, `.xslt`
- TailwindCSS: `.css`, `.html` (with TailwindCSS classes)
- GitLab CI: `.gitlab-ci.yml`, `.gitlab-ci.yaml`
- GitHub Actions: `.github/workflows/*.yml`, `.github/workflows/*.yaml`
- Git: `.gitignore`, `.gitattributes`, `.gitmodules`
- Lua: `.lua`
- OpenTofu: `.tf`, `.tfvars`
- Podman/Dockerfile: `Dockerfile`, `Containerfile`, `*.dockerfile`
- NixD: `.nix` (same as nil)
- Oxide: `.ox`

## Environment Considerations

Some LSP servers and formatters may require specific environment variables or PATH configurations. These will be documented in the implementation phase.
