#!/usr/bin/env node
/**
 * NixOS MCP Helper
 *
 * Provides CLI interface for nixos-mcp to search packages, manage environments,
 * and work with Nix expressions
 *
 * Usage:
 *   node nixos-helper.js search --package "python"
 *   node nixos-helper.js env --packages "python,nodejs,git"
 *   node nixos-helper.js config --service "nginx"
 */

const fs = require('fs');
const { execSync } = require('child_process');

// Configuration for nixos-mcp
const NIXOS_CONFIG = {
  type: 'stdio',
  command: 'uvx',
  args: ['mcp-nixos'],
  enabled: true
};

/**
 * NixOS Helper CLI
 */
class NixOSHelper {
  constructor() {
    this.config = NIXOS_CONFIG;
  }

  /**
   * Parse command line arguments
   */
  parseArgs(args) {
    const command = args[2]; // After node and script

    const parsed = {
      command: command,
      package: null,
      packages: [],
      service: null,
      output: null,
      channel: 'nixos-unstable',
      help: false
    };

    if (!command || command === '--help' || command === '-h') {
      parsed.help = true;
      return parsed;
    }

    for (let i = 3; i < args.length; i++) {
      const arg = args[i];

      switch (arg) {
        case '--package':
        case '-p':
          parsed.package = args[++i];
          break;
        case '--packages':
        case '-P':
          parsed.packages = args[++i].split(',').map(p => p.trim());
          break;
        case '--service':
        case '-s':
          parsed.service = args[++i];
          break;
        case '--output':
        case '-o':
          parsed.output = args[++i];
          break;
        case '--channel':
        case '-c':
          parsed.channel = args[++i];
          break;
        case '--help':
        case '-h':
          parsed.help = true;
          break;
      }
    }

    return parsed;
  }

  /**
   * Generate MCP request for nixos-mcp
   */
  generateMcpRequest(command, args) {
    const requests = {
      search: {
        jsonrpc: '2.0',
        id: 1,
        method: 'tools/call',
        params: {
          name: 'nixos_search_packages',
          arguments: {
            query: args.package,
            channel: args.channel,
            limit: 20
          }
        }
      },
      env: {
        jsonrpc: '2.0',
        id: 1,
        method: 'tools/call',
        params: {
          name: 'nixos_create_environment',
          arguments: {
            packages: args.packages,
            channel: args.channel,
            type: 'shell'
          }
        }
      },
      config: {
        jsonrpc: '2.0',
        id: 1,
        method: 'tools/call',
        params: {
          name: 'nixos_generate_config',
          arguments: {
            service: args.service,
            channel: args.channel
          }
        }
      }
    };

    return requests[command];
  }

  /**
   * Search for Nix packages
   */
  async searchPackages(packageName, channel) {
    console.log(`Searching for packages: ${packageName}`);
    console.log(`Channel: ${channel}`);
    console.log('');

    // Generate MCP request
    const request = this.generateMcpRequest('search', { package: packageName, channel });
    console.log('MCP Request:');
    console.log(JSON.stringify(request, null, 2));
    console.log('');

    // Mock response
    const mockResults = {
      query: packageName,
      channel: channel,
      packages: [
        {
          name: packageName,
          version: '1.0.0',
          description: `The ${packageName} package`,
          attribute: `pkgs.${packageName}`,
          license: 'MIT'
        },
        {
          name: `${packageName}-dev`,
          version: '1.0.0',
          description: `Development package for ${packageName}`,
          attribute: `pkgs.${packageName}dev`,
          license: 'MIT'
        }
      ]
    };

    console.log('Search Results:');
    console.log(JSON.stringify(mockResults, null, 2));

    return mockResults;
  }

  /**
   * Create development environment
   */
  async createEnvironment(packages, channel) {
    console.log(`Creating Nix environment with packages:`);
    packages.forEach(pkg => console.log(`  - ${pkg}`));
    console.log(`Channel: ${channel}`);
    console.log('');

    // Generate MCP request
    const request = this.generateMcpRequest('env', { packages, channel });
    console.log('MCP Request:');
    console.log(JSON.stringify(request, null, 2));
    console.log('');

    // Generate shell.nix
    const shellNix = this.generateShellNix(packages);

    console.log('Generated shell.nix:');
    console.log(shellNix);

    // Write to file if output specified
    return shellNix;
  }

  /**
   * Generate shell.nix content
   */
  generateShellNix(packages) {
    const packageList = packages.map(pkg => `    ${pkg}`).join('\n');

    return `{ pkgs ? import <nixpkgs> {} }:

pkgs.mkShell {
  buildInputs = with pkgs; [
${packageList}
  ];

  # Set environment variables
  shellHook = ''
    echo "Nix development environment activated"
  '';
}
`;
  }

  /**
   * Generate NixOS configuration
   */
  async generateConfig(serviceName, channel) {
    console.log(`Generating NixOS configuration for service: ${serviceName}`);
    console.log(`Channel: ${channel}`);
    console.log('');

    // Generate MCP request
    const request = this.generateMcpRequest('config', { service: serviceName, channel });
    console.log('MCP Request:');
    console.log(JSON.stringify(request, null, 2));
    console.log('');

    // Generate configuration
    const config = this.generateServiceConfig(serviceName);

    console.log('Generated NixOS Configuration:');
    console.log(config);

    return config;
  }

  /**
   * Generate service configuration
   */
  generateServiceConfig(serviceName) {
    const configs = {
      nginx: `
# Nginx Configuration for /etc/nixos/configuration.nix

{ pkgs, ... }:

{
  # Enable nginx
  services.nginx = {
    enable = true;
    recommendedGzipSettings = true;
    recommendedOptimisation = true;

    # Virtual hosts
    virtualHosts = {
      "localhost" = {
        root = "/var/www";
        enablePHP = true;
      };
    };
  };

  # Open firewall
  networking.firewall.allowedTCPPorts = [ 80 443 ];
}
`,
      postgresql: `
# PostgreSQL Configuration for /etc/nixos/configuration.nix

{ pkgs, ... }:

{
  # Enable PostgreSQL
  services.postgresql = {
    enable = true;
    package = pkgs.postgresql_14;
    enableTCPIP = true;
    port = 5432;
    authentication = ''
      local all all trust
      host all all 127.0.0.1/32 md5
      host all all ::1/128 md5
    '';
  };

  # Create database
  systemd.services.postgresql = {
    serviceConfig.ExecStartPost = [
      "-c log_line_prefix=%t "
      "-c log_statement=mod "
      "-c log_duration=on "
      "-c log_lock_waits=on"
    ];
  };
}
`,
      docker: `
# Docker Configuration for /etc/nixos/configuration.nix

{ pkgs, ... }:

{
  # Enable Docker
  virtualisation.docker = {
    enable = true;
    enableOnBoot = true;
    storageDriver = "overlay2";
  };

  # Allow docker to run without root
  users.groups.docker = {};
  users.extraUsers.docker = {
    extraGroups = [ "docker" ];
  };
}
`
    };

    return configs[serviceName] || `# Configuration for ${serviceName}

{ pkgs, ... }:

{
  # Add your configuration here
  # services.${serviceName} = {
  #   enable = true;
  # };
}
`;
  }

  /**
   * Show help for specific command
   */
  showCommandHelp(command) {
    const helpText = {
      search: `
Search Command - Find Nix packages

Usage:
  node nixos-helper.js search --package "package-name" [--channel nixos-unstable]

Options:
  --package, -p <name>     Package name to search for (required)
  --channel, -c <channel>  Nix channel (default: nixos-unstable)

Examples:
  # Search for Python
  node nixos-helper.js search --package "python"

  # Search with specific channel
  node nixos-helper.js search --package "nodejs" --channel "nixos-23.11"
`,
      env: `
Environment Command - Create development environment

Usage:
  node nixos-helper.js env --packages "pkg1,pkg2,pkg3" [--output shell.nix]

Options:
  --packages, -P <list>    Comma-separated list of packages
  --output, -o <file>      Output file (default: prints to stdout)

Examples:
  # Python development environment
  node nixos-helper.js env --packages "python311,python311Packages.pip"

  # Node.js environment
  node nixos-helper.js env --packages "nodejs-18_x,npm-8_x,yarn"

  # Save to file
  node nixos-helper.js env --packages "python,git,vim" --output shell.nix
`,
      config: `
Config Command - Generate NixOS service configuration

Usage:
  node nixos-helper.js config --service "service-name" [--output config.nix]

Options:
  --service, -s <name>     Service name (nginx, postgresql, docker, etc.)
  --output, -o <file>      Output file (default: prints to stdout)

Examples:
  # Generate nginx configuration
  node nixos-helper.js config --service nginx

  # Generate PostgreSQL configuration
  node nixos-helper.js config --service postgresql

  # Save to file
  node nixos-helper.js config --service docker --output docker-config.nix
`
    };

    console.log(helpText[command] || helpText.search);
  }

  /**
   * Show general help
   */
  showHelp() {
    console.log(`
NixOS MCP Helper

Provides CLI interface for nixos-mcp server

Usage:
  node nixos-helper.js <command> [options]

Commands:
  search                Search for Nix packages
  env                   Create development environment
  config                Generate NixOS service configuration

Examples:
  # Search for packages
  node nixos-helper.js search --package "python"

  # Create development environment
  node nixos-helper.js env --packages "python,git,vim"

  # Generate service configuration
  node nixos-helper.js config --service nginx

For detailed help on a specific command:
  node nixos-helper.js <command> --help

Available services for config:
  nginx, postgresql, docker, and more
`);
  }
}

// Main execution
if (require.main === module) {
  const helper = new NixOSHelper();
  const args = helper.parseArgs(process.argv);

  if (args.help || !args.command) {
    helper.showHelp();
    process.exit(0);
  }

  // Show command-specific help
  if (process.argv.includes('--help') || process.argv.includes('-h')) {
    helper.showCommandHelp(args.command);
    process.exit(0);
  }

  // Execute command
  switch (args.command) {
    case 'search':
      if (!args.package) {
        console.error('Error: --package is required for search command');
        process.exit(1);
      }
      helper.searchPackages(args.package, args.channel)
        .then(result => {
          if (args.output) {
            fs.writeFileSync(args.output, JSON.stringify(result, null, 2));
            console.log(`\nResults saved to: ${args.output}`);
          }
        });
      break;

    case 'env':
      if (!args.packages || args.packages.length === 0) {
        console.error('Error: --packages is required for env command');
        process.exit(1);
      }
      helper.createEnvironment(args.packages, args.channel)
        .then(shellNix => {
          if (args.output) {
            fs.writeFileSync(args.output, shellNix);
            console.log(`\nEnvironment configuration saved to: ${args.output}`);
          }
        });
      break;

    case 'config':
      if (!args.service) {
        console.error('Error: --service is required for config command');
        process.exit(1);
      }
      helper.generateConfig(args.service, args.channel)
        .then(config => {
          if (args.output) {
            fs.writeFileSync(args.output, config);
            console.log(`\nConfiguration saved to: ${args.output}`);
          }
        });
      break;

    default:
      console.error(`Unknown command: ${args.command}`);
      helper.showHelp();
      process.exit(1);
  }
}

module.exports = NixOSHelper;
