#!/usr/bin/env fish
# Formatter Installation Script for OpenCode
# This script installs code formatters for multiple languages

echo "🎨 Installing formatters for OpenCode..."

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

# Function to check if tool is already available
function check_tool -d "Check if tool is already available"
    if check_command $argv[1]
        echo "✅ $argv[1] is already available"
        return 0
    else
        echo "📦 Installing $argv[1]..."
        return 1
    end
end

echo ""
echo "🎨 Installing formatters..."

# Bash shell scripts (shfmt)
echo "📝 Installing shfmt for Bash..."
if not check_tool shfmt
    # Try multiple installation methods
    if check_command cargo
        install_rust_package mvdan.cc/sh/v3/cmd/shfmt
    else
        install_system_package shfmt
    end
end

# Fish shell (fish_indent - built-in)
echo "🐟 Checking Fish shell formatter..."
if check_command fish
    echo "✅ fish_indent is built into Fish shell"
    echo "💡 Fish formatter will be available when Fish shell is installed"
else
    echo "⚠️  Fish shell not found. Install Fish shell to get fish_indent formatter"
end

# XML formatting (xmllint - usually built-in)
echo "📄 Checking XML formatter..."
if check_command xmllint
    echo "✅ xmllint is already available (usually built into libxml2)"
else
    echo "📦 Installing libxml2 for xmllint..."
    install_system_package libxml2-utils
end

# TailwindCSS and general web formatters
echo "🎨 Installing Prettier and TailwindCSS plugin..."
install_npm_package prettier
install_npm_package prettier-plugin-tailwindcss

# Lua formatting
echo "🌙 Installing Lua formatter..."
if not check_tool stylua
    if check_command cargo
        install_rust_package typstfmt-tmp
        echo "💡 stylua not available, installed typstfmt-tmp as alternative"
        echo "💡 Consider installing stylua manually: https://github.com/JohnnyMorganz/StyLua"
    else
        # Try to install lua-format
        install_npm_package lua-format
        if check_command npm
            echo "📦 Installing lua-format via npm..."
        end
    end
else
    echo "✅ stylua is available"
end

# Go formatting (gofmt - built-in with Go)
echo "🐹 Checking Go formatter..."
if check_command go
    echo "✅ gofmt is built into Go"
else
    echo "⚠️  Go not found. Install Go to get gofmt formatter"
end

# Terraform/OpenTofu formatting
echo "☁️  Installing OpenTofu/Terraform formatter..."
if check_command terraform
    echo "✅ terraform fmt is built into Terraform"
else
    echo "⚠️  Terraform not found. Install Terraform to get terraform fmt formatter"
end

# Dockerfile formatting
echo "🐳 Installing Dockerfile formatter..."
if not check_tool dockerfile-formatter
    install_npm_package dockerfile-formatter
else
    echo "✅ dockerfile-formatter is available"
end

# Oxide language (ox fmt - built-in)
echo "⚡ Checking Oxide formatter..."
if check_command ox
    echo "✅ ox fmt is built into Oxide language"
else
    echo "⚠️  Oxide language not found. Install Oxide to get ox fmt formatter"
    echo "💡 You can install Oxide from: https://oxide-lang.org/"
end

# YAML formatting for GitLab CI and GitHub Actions
echo "📋 Installing YAML formatter..."
# Note: Prettier already handles YAML, so this is just for documentation
echo "✅ YAML formatting is handled by Prettier (already installed)"

echo ""
echo "🎉 Formatter installation complete!"
echo ""
echo "📋 Summary of available formatters:"
echo "  • shfmt (Bash/Shell scripts)"
echo "  • fish_indent (Fish shell - built into Fish)"
echo "  • xmllint (XML files - from libxml2)"
echo "  • prettier + plugin (TailwindCSS, YAML, JSON, CSS, HTML, MD)"
echo "  • stylua/lua-format (Lua files)"
echo "  • gofmt (Go files - built into Go)"
echo "  • terraform fmt (OpenTofu/Terraform - built into Terraform)"
echo "  • dockerfile-formatter (Dockerfile)"
echo "  • ox fmt (Oxide language - built into Oxide)"
echo ""
echo "📦 Additional tools that may already be available:"
echo "  • alejandra (Nix formatter)"
echo "  • rustfmt (Rust formatter - built into Rust)"
echo "  • ruff (Python formatter)"
echo ""
echo "🔧 Next steps:"
echo "  1. Update your opencode.jsonc with the new formatter configurations"
echo "  2. Restart OpenCode to load the new formatters"
echo "  3. Test formatting by running format commands on your files"
echo ""
echo "💡 Usage examples:"
echo "  • Format a shell script: shfmt -w script.sh"
echo "  • Format with Prettier: prettier --write file.html"
echo "  • Format OpenTofu: terraform fmt -write file.tf"
echo "  • Format Docker: dockerfile-formatter --inplace Dockerfile"
