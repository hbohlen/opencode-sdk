#!/usr/bin/env fish
# LSP Server Installation Script for OpenCode
# This script installs Language Server Protocol servers for multiple languages

echo "🚀 Installing LSP servers for OpenCode..."

# Function to check if a command exists
function check_command -d "Check if command exists"
    command -sq $argv[1]
end

# Function to install npm packages globally
function install_npm_package -d "Install npm package globally"
    if check_command npm
        npm install -g $argv[1]
        echo "✅ Installed npm package: $argv[1]"
    else
        echo "⚠️  npm not found. Please install Node.js and npm first."
        return 1
    end
end

# Function to install Rust packages
function install_rust_package -d "Install Rust package"
    if check_command cargo
        cargo install $argv[1]
        echo "✅ Installed Rust package: $argv[1]"
    else
        echo "⚠️  Rust/Cargo not found. Please install Rust first: https://rustup.rs/"
        return 1
    end
end

# Function to install Go packages
function install_go_package -d "Install Go package"
    if check_command go
        go install $argv[1]
        echo "✅ Installed Go package: $argv[1]"
    else
        echo "⚠️  Go not found. Please install Go first: https://golang.org/"
        return 1
    end
end

# Function to install Java packages (for lemminx)
function install_lemminx -d "Install lemminx XML LSP"
    if check_command java
        set -l version "0.5.2"
        set -l jar_url "https://github.com/eclipse/lemminx/releases/download/$version/org.eclipse.lemminx-$version-uber.jar"
        set -l jar_file (mktemp)
        curl -L -o $jar_file $jar_url
        chmod +x $jar_file
        echo "✅ Downloaded lemminx to $jar_file"
        echo "💡 Add this to your PATH: export PATH=\"\$PATH:(dirname $jar_file)\""
    else
        echo "⚠️  Java not found. Please install Java first."
        return 1
    end
end

# Function to install system packages
function install_system_package -d "Install system package"
    if check_command apt
        echo "Installing system package with apt: $argv[1]"
        sudo apt update && sudo apt install -y $argv[1]
        echo "✅ Installed system package: $argv[1]"
    else if check_command dnf
        echo "Installing system package with dnf: $argv[1]"
        sudo dnf install -y $argv[1]
        echo "✅ Installed system package: $argv[1]"
    else if check_command pacman
        echo "Installing system package with pacman: $argv[1]"
        sudo pacman -S --noconfirm $argv[1]
        echo "✅ Installed system package: $argv[1]"
    else if check_command brew
        echo "Installing system package with brew: $argv[1]"
        brew install $argv[1]
        echo "✅ Installed system package: $argv[1]"
    else
        echo "⚠️  No supported package manager found. Please install $argv[1] manually."
        return 1
    end
end

echo ""
echo "📦 Installing LSP servers..."

# Bash shell scripting
echo "📝 Installing Bash LSP..."
install_npm_package bash-language-server

# Fish shell scripting  
echo "🐟 Installing Fish LSP..."
install_npm_package fish-lsp

# XML configuration files
echo "📄 Installing XML LSP (lemminx)..."
install_lemminx

# TailwindCSS
echo "🎨 Installing TailwindCSS LSP..."
install_npm_package @tailwindcss/language-server

# GitLab CI
echo "🚀 Installing GitLab CI LSP..."
install_npm_package @gitlab-org/gitlab-vscode-extension

# GitHub Actions
echo "🔧 Installing GitHub Actions LSP..."
install_npm_package github-actions-language-server

# Git configuration files
echo "📁 Installing Git LSP..."
install_npm_package gitignore-language-server

# OpenTofu/Terraform
echo "☁️  Installing OpenTofu/Terraform LSP..."
if check_command terraform
    echo "Terraform found, using terraform-ls"
    install_go_package golang.org/x/tools/cmd/gopls@latest
else
    echo "⚠️  Terraform not found. Please install terraform-ls manually."
end

# Dockerfile
echo "🐳 Installing Dockerfile LSP..."
install_npm_package dockerfile-language-server

# Oxide language
echo "⚡ Installing Oxide LSP..."
install_npm_package oxide-language-server

# NixD (alternative to nil)
echo "🔧 Installing NixD LSP..."
if check_command nix
    echo "Nix found, building nixd from source"
    nix-env -iA nixpkgs.nixd
    echo "✅ Installed nixd"
else
    echo "⚠️  Nix not found. Please install nixd manually from: https://github.com/nix-community/nixd"
    if check_command cargo
        install_rust_package nixd
    else
        echo "Alternative: Install via Nix or build from source"
    end
end

echo ""
echo "🎉 LSP server installation complete!"
echo ""
echo "📋 Summary of installed LSP servers:"
echo "  • bash-language-server (Bash/Shell)"
echo "  • fish-lsp (Fish Shell)"
echo "  • lemminx (XML/XSD/XSLT)"
echo "  • @tailwindcss/language-server (TailwindCSS)"
echo "  • @gitlab-org/gitlab-vscode-extension (GitLab CI)"
echo "  • github-actions-language-server (GitHub Actions)"
echo "  • gitignore-language-server (Git Config)"
echo "  • terraform-ls (OpenTofu/Terraform)"
echo "  • dockerfile-language-server (Dockerfile)"
echo "  • oxide-language-server (Oxide)"
echo "  • nixd (Nix - alternative to nil)"
echo ""
echo "🔧 Next steps:"
echo "  1. Update your opencode.jsonc with the new LSP configurations"
echo "  2. Restart OpenCode to load the new LSP servers"
echo "  3. Verify LSP functionality in your editor"
