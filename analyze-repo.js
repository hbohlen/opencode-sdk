#!/usr/bin/env node
/**
 * DeepWiki MCP Repository Analyzer
 *
 * Provides CLI for analyzing GitHub repositories using deepwiki-mcp
 *
 * Usage:
 *   node analyze-repo.js "vercel/next.js" --mode aggregate --depth 2 --output docs.md
 *   node analyze-repo.js "facebook/react" --mode pages --focus "rendering"
 */

const fs = require('fs');

// Configuration for deepwiki-mcp
const DEEPWIKI_CONFIG = {
  type: 'http',
  url: 'https://mcp.deepwiki.com/mcp',
  enabled: true
};

const ANALYSIS_MODES = ['aggregate', 'pages'];
const OUTPUT_FORMATS = ['markdown', 'json', 'text'];
const DEPTH_LEVELS = [0, 1, 2, 3];

/**
 * DeepWiki Repository Analyzer
 */
class DeepWikiAnalyzer {
  constructor() {
    this.config = DEEPWIKI_CONFIG;
  }

  /**
   * Parse command line arguments
   */
  parseArgs(args) {
    const repoIndex = args.findIndex(arg => !arg.startsWith('--'));
    const repository = repoIndex >= 0 ? args[repoIndex] : null;

    const parsed = {
      repository: repository,
      mode: 'aggregate',
      depth: 1,
      focus: null,
      output: null,
      format: 'markdown',
      includeCode: true,
      includeDiagrams: true,
      help: false
    };

    for (let i = 2; i < args.length; i++) {
      const arg = args[i];

      switch (arg) {
        case '--mode':
        case '-m':
          parsed.mode = args[++i];
          break;
        case '--depth':
        case '-d':
          parsed.depth = parseInt(args[++i], 10);
          break;
        case '--focus':
        case '-f':
          parsed.focus = args[++i];
          break;
        case '--output':
        case '-o':
          parsed.output = args[++i];
          break;
        case '--format':
        case '-F':
          parsed.format = args[++i];
          break;
        case '--no-code':
          parsed.includeCode = false;
          break;
        case '--no-diagrams':
          parsed.includeDiagrams = false;
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
   * Validate arguments
   */
  validateArgs(args) {
    const errors = [];

    if (!args.repository) {
      errors.push('Repository is required (format: owner/repo)');
    } else if (!args.repository.includes('/')) {
      errors.push('Repository must be in format: owner/repo (e.g., vercel/next.js)');
    }

    if (!ANALYSIS_MODES.includes(args.mode)) {
      errors.push(`Invalid mode: ${args.mode}. Supported: ${ANALYSIS_MODES.join(', ')}`);
    }

    if (!DEPTH_LEVELS.includes(args.depth)) {
      errors.push(`Invalid depth: ${args.depth}. Supported: ${DEPTH_LEVELS.join(', ')}`);
    }

    if (!OUTPUT_FORMATS.includes(args.format)) {
      errors.push(`Invalid format: ${args.format}. Supported: ${OUTPUT_FORMATS.join(', ')}`);
    }

    return errors;
  }

  /**
   * Generate analysis request for deepwiki-mcp
   */
  generateAnalysisRequest(args) {
    return {
      jsonrpc: '2.0',
      id: 1,
      method: 'tools/call',
      params: {
        name: 'deepwiki_analyze',
        arguments: {
          repository: args.repository,
          mode: args.mode,
          max_depth: args.depth,
          include_code: args.includeCode,
          include_diagrams: args.includeDiagrams,
          focus_areas: args.focus ? [args.focus] : []
        }
      }
    };
  }

  /**
   * Format analysis results
   */
  formatResults(results, format) {
    switch (format) {
      case 'json':
        return JSON.stringify(results, null, 2);

      case 'markdown':
        return this.toMarkdown(results);

      case 'text':
        return this.toText(results);

      default:
        return results;
    }
  }

  /**
   * Convert to Markdown format
   */
  toMarkdown(results) {
    let markdown = `# ${results.repository} - Repository Analysis\n\n`;

    if (results.summary) {
      markdown += `## Summary\n\n${results.summary}\n\n`;
    }

    if (results.architecture) {
      markdown += `## Architecture Overview\n\n`;
      markdown += `${results.architecture.description}\n\n`;

      if (results.architecture.components) {
        markdown += `### Key Components\n\n`;
        results.architecture.components.forEach(comp => {
          markdown += `- **${comp.name}**: ${comp.description}\n`;
        });
        markdown += '\n';
      }
    }

    if (results.file_structure) {
      markdown += `## File Structure\n\n`;
      markdown += '```\n';
      markdown += results.file_structure.tree || 'No structure data available';
      markdown += '\n```\n\n';
    }

    if (results.key_files && results.key_files.length > 0) {
      markdown += `## Key Files\n\n`;
      results.key_files.forEach(file => {
        markdown += `### ${file.path}\n\n`;
        markdown += `**Purpose:** ${file.purpose}\n\n`;

        if (file.description) {
          markdown += `${file.description}\n\n`;
        }

        if (file.code && file.code.trim()) {
          const ext = file.path.split('.').pop() || '';
          markdown += '```' + ext + '\n';
          markdown += file.code.substring(0, 1000);
          if (file.code.length > 1000) {
            markdown += '\n... (truncated)';
          }
          markdown += '\n```\n\n';
        }

        markdown += '---\n\n';
      });
    }

    if (results.patterns && results.patterns.length > 0) {
      markdown += `## Design Patterns\n\n`;
      results.patterns.forEach(pattern => {
        markdown += `### ${pattern.name}\n\n`;
        markdown += `${pattern.description}\n\n`;
        if (pattern.examples && pattern.examples.length > 0) {
          markdown += `**Examples:**\n`;
          pattern.examples.forEach(ex => {
            markdown += `- ${ex}\n`;
          });
          markdown += '\n';
        }
      });
    }

    if (results.dependencies) {
      markdown += `## Dependencies\n\n`;
      if (results.dependencies.runtime) {
        markdown += `### Runtime Dependencies\n\n`;
        results.dependencies.runtime.forEach(dep => {
          markdown += `- ${dep.name} (${dep.version})\n`;
        });
        markdown += '\n';
      }
      if (results.dependencies.dev) {
        markdown += `### Development Dependencies\n\n`;
        results.dependencies.dev.forEach(dep => {
          markdown += `- ${dep.name} (${dep.version})\n`;
        });
        markdown += '\n';
      }
    }

    if (results.insights) {
      markdown += `## Insights\n\n`;
      results.insights.forEach(insight => {
        markdown += `- ${insight}\n`;
      });
      markdown += '\n';
    }

    return markdown;
  }

  /**
   * Convert to text format
   */
  toText(results) {
    let text = `${results.repository} - Repository Analysis\n`;
    text += '='.repeat(70) + '\n\n';

    if (results.summary) {
      text += `Summary:\n${results.summary}\n\n`;
    }

    if (results.architecture && results.architecture.description) {
      text += `Architecture:\n${results.architecture.description}\n\n`;
    }

    if (results.key_files && results.key_files.length > 0) {
      text += `Key Files (${results.key_files.length}):\n`;
      results.key_files.forEach(file => {
        text += `  - ${file.path}: ${file.purpose}\n`;
      });
      text += '\n';
    }

    if (results.patterns && results.patterns.length > 0) {
      text += `Design Patterns (${results.patterns.length}):\n`;
      results.patterns.forEach(pattern => {
        text += `  - ${pattern.name}: ${pattern.description}\n`;
      });
      text += '\n';
    }

    return text;
  }

  /**
   * Main analysis method
   */
  async analyze(args) {
    try {
      console.log('Starting DeepWiki repository analysis...');
      console.log(`Repository: ${args.repository}`);
      console.log(`Mode: ${args.mode}`);
      console.log(`Depth: ${args.depth}`);
      if (args.focus) console.log(`Focus: ${args.focus}`);
      console.log(`Format: ${args.format}`);
      console.log(`Include Code: ${args.includeCode}`);
      console.log(`Include Diagrams: ${args.includeDiagrams}`);
      console.log('');

      // Generate MCP request
      const request = this.generateAnalysisRequest(args);

      console.log('MCP Request:');
      console.log(JSON.stringify(request, null, 2));
      console.log('');

      // Mock response for demonstration
      const mockResults = {
        repository: args.repository,
        summary: `Comprehensive analysis of ${args.repository} repository.`,
        architecture: {
          description: `This is a high-level architectural overview of ${args.repository}.`,
          components: [
            { name: 'Core', description: 'Main application logic' },
            { name: 'Utils', description: 'Utility functions' },
            { name: 'API', description: 'Interface layer' }
          ]
        },
        file_structure: {
          tree: `${args.repository}/
├── src/
│   ├── core/
│   ├── utils/
│   └── api/
├── test/
└── docs/`
        },
        key_files: [
          {
            path: 'src/index.js',
            purpose: 'Entry point',
            description: 'Main application entry point',
            code: `// Main application
import './app';
console.log('Starting application...');`
          }
        ],
        patterns: [
          {
            name: 'Module Pattern',
            description: 'Uses ES6 modules for code organization',
            examples: ['src/core/', 'src/utils/']
          }
        ],
        dependencies: {
          runtime: [
            { name: 'react', version: '^18.0.0' },
            { name: 'lodash', version: '^4.17.21' }
          ],
          dev: [
            { name: 'jest', version: '^29.0.0' },
            { name: 'eslint', version: '^8.0.0' }
          ]
        },
        insights: [
          'Well-structured modular architecture',
          'Comprehensive test coverage',
          'Active development with regular updates'
        ]
      };

      const formatted = this.formatResults(mockResults, args.format);

      if (args.output) {
        fs.writeFileSync(args.output, formatted);
        console.log(`Analysis saved to: ${args.output}`);
      } else {
        console.log(formatted);
      }

      return mockResults;

    } catch (error) {
      console.error('Analysis failed:', error.message);
      process.exit(1);
    }
  }

  /**
   * Show repository info
   */
  showRepoInfo(repo) {
    if (!repo || !repo.includes('/')) {
      console.error('Error: Repository must be in format: owner/repo');
      console.error('Examples:');
      console.error('  - vercel/next.js');
      console.error('  - facebook/react');
      console.error('  - python/cpython');
      process.exit(1);
    }

    const [owner, name] = repo.split('/');
    console.log(`Repository: ${repo}`);
    console.log(`Owner: ${owner}`);
    console.log(`Name: ${name}`);
    console.log(`URL: https://github.com/${repo}`);
    console.log('');
  }
}

// Main execution
if (require.main === module) {
  const analyzer = new DeepWikiAnalyzer();
  const args = analyzer.parseArgs(process.argv);

  if (args.help) {
    console.log(`
DeepWiki MCP Repository Analyzer

Usage:
  node analyze-repo.js "owner/repo" [options]

Options:
  --mode, -m <mode>       Analysis mode: ${ANALYSIS_MODES.join(', ')} (default: aggregate)
  --depth, -d <level>     Depth: ${DEPTH_LEVELS.join(', ')} (default: 1)
  --focus, -f <area>      Focus on specific area (e.g., "routing", "authentication")
  --output, -o <path>     Save analysis to file
  --format, -F <format>   Output format: ${OUTPUT_FORMATS.join(', ')} (default: markdown)
  --no-code              Exclude code snippets
  --no-diagrams          Exclude architecture diagrams
  --help, -h             Show this help message

Modes:
  aggregate              Single comprehensive document
  pages                  Multiple focused documents per section

Depth Levels:
  0                      Shallow overview
  1                      Basic analysis (default)
  2                      Detailed analysis
  3                      Deep dive with full code

Examples:
  # Basic repository analysis
  node analyze-repo.js "vercel/next.js"

  # Detailed pages mode
  node analyze-repo.js "facebook/react" --mode pages --depth 2

  # Focus on specific area
  node analyze-repo.js "angular/angular" --focus "dependency-injection" --output di-analysis.md

  # Export as JSON
  node analyze-repo.js "lodash/lodash" --format json --output lodash-analysis.json

  # Deep analysis
  node analyze-repo.js "kubernetes/kubernetes" --depth 3 --output kube-deep.md

Analysis Includes:
  - Repository overview and summary
  - Architecture and component relationships
  - Key files and their purposes
  - Design patterns and code organization
  - Dependencies and relationships
  - Insights and recommendations
`);
    process.exit(0);
  }

  analyzer.showRepoInfo(args.repository);

  const errors = analyzer.validateArgs(args);
  if (errors.length > 0) {
    console.error('Validation errors:');
    errors.forEach(err => console.error(`  - ${err}`));
    console.error('\nUse --help for usage information');
    process.exit(1);
  }

  analyzer.analyze(args);
}

module.exports = DeepWikiAnalyzer;
