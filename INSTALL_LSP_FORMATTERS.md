# Installation Instructions for New LSP Servers and Formatters

This document provides installation instructions for all the new LSP servers and formatters added in the "Add LSP and Formatters" change proposal.

## System Dependencies

### Required System Packages

```bash
# Install system-level dependencies
# Ubuntu/Debian:
sudo apt-get install -y \
  bash \
  fish \
  libxml2-utils \
  go \
  terraform

# macOS (using Homebrew):
brew install \
  bash \
  fish \
  libxml2 \
  go \
  terraform

# Or install via Nix (if using NixOS):
nix-env -iA nixos.bash nixos.fish nixos.libxml2 nixos.go nixos.terraform
```

## NPM-based LSP Servers

Install via npm (already configured for most tools):

```bash
# Global npm packages
npm install -g bash-language-server
npm install -g tailwindcss-language-server
npm install -g gitlab-ci-localization-server
npm install -g github-actions-language-server
npm install -g git-language-server
npm install -g dockerfile-language-server-nodejs
```

## Language-Specific Installations

### Fish Shell

```bash
# Install fish-lsp (Rust-based, may need cargo)
cargo install fish-lsp
# Or build from source:
git clone https://github.com/Nick-Donfris/fish-lsp.git
cd fish-lsp
cargo build --release
```

### XML Language Server (lemminx)

```bash
# Download and install lemminx
wget https://github.com/eclipse/lemminx/releases/latest/download/lemminx-linux
chmod +x lemminx-linux
sudo mv lemminx-linux /usr/local/bin/lemminx
```

### OpenTofu/Terraform

```bash
# Install terraform-ls (part of Terraform tools)
# Usually comes with Terraform installation
wget -O- https://apt.releases.hashicorp.com/gpg | sudo gpg --dearmor -o /usr/share/keyrings/hashicorp-archive-keyring.gpg
echo "deb [signed-by=/usr/share/keyrings/hashicorp-archive-keyring.gpg] https://apt.releases.hashicorp.com $(lsb_release -cs) main" | sudo tee /etc/apt/sources.list.d/hashicorp.list
sudo apt-get update && sudo apt-get install terraform terraform-ls
```

### NixD (Alternative to nil)

```bash
# Install nixd (C++ implementation)
# Via Nix:
nix-env -iA nixos.nixd

# Or via package manager:
# Ubuntu/Debian:
sudo apt-get install nixd

# macOS:
brew install nixd
```

### Oxide Language

```bash
# Install oxc tools (Rust-based)
# Via cargo:
cargo install oxc_cli

# Or build from source:
git clone https://github.com/oxc-project/oxc.git
cd oxc
cargo install --bin oxc_cli
```

## Formatter Installations

### Bash Formatter (shfmt)

```bash
# Install shfmt (already in most systems)
# Ubuntu/Debian:
sudo apt-get install shfmt

# macOS:
brew install shfmt

# Or via go:
go install mvdan.cc/sh/v3/cmd/shfmt@latest
```

### Fish Shell Formatter

```bash
# fish_indent comes with fish shell installation
# Ubuntu/Debian:
sudo apt-get install fish

# macOS:
brew install fish
```

### XML Formatter

```bash
# xmllint comes with libxml2
# Ubuntu/Debian:
sudo apt-get install libxml2-utils

# macOS:
brew install libxml2

# Alternative: xmlformat (Python-based)
pip install xmlformat
```

### Lua Formatter

```bash
# Install lua-format
# Ubuntu/Debian:
sudo apt-get install lua5.3

# macOS:
brew install lua

# Install lua-format via luarocks:
luarocks install luaformatter
```

## Configuration Verification

After installation, verify LSP servers are working:

```bash
# Test bash language server
bash-language-server --version

# Test fish LSP
fish-lsp --version

# Test lemminx
lemminx --version

# Test terraform-ls
terraform-ls --version
```

## Troubleshooting

### Common Issues

1. **Command not found errors**: Ensure tools are in your PATH
2. **Permission errors**: Some tools may need to be installed with sudo or user permissions
3. **Version mismatches**: Ensure you have compatible versions of dependencies

### Verification Commands

```bash
# Check if all LSP servers are installed
for cmd in bash-language-server fish-lsp lemminx terraform-ls nixd oxc; do
    if command -v $cmd >/dev/null 2>&1; then
        echo "✅ $cmd is installed"
    else
        echo "❌ $cmd is NOT installed"
    fi
done
```

## Cross-Platform Notes

- Most npm-based tools will work across platforms
- System packages may vary between distributions
- Rust-based tools (fish-lsp, oxc) require Rust toolchain
- Go-based tools require Go installation
- Java-based tools (lemminx) require Java runtime

## Integration with OpenCode

After installation, restart OpenCode and the new LSP servers and formatters should be automatically detected and used for their respective file types.
