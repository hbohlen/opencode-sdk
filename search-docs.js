#!/usr/bin/env node
/**
 * Context7 MCP Documentation Search
 *
 * Provides CLI interface for context7-mcp to search comprehensive documentation
 *
 * Usage:
 *   node search-docs.js "React hooks" --library React --type api
 *   node search-docs.js "database transactions" --type examples --output results.md
 */

const fs = require('fs');

// Configuration for context7-mcp
const CONTEXT7_CONFIG = {
  type: 'http',
  url: 'https://mcp.context7.com/mcp',
  headers: {
    CONTEXT7_API_KEY: '${env:CONTEXT7_API_KEY}'
  },
  enabled: true
};

const LIBRARIES = [
  'react', 'vue', 'angular', 'nodejs', 'python', 'django', 'flask',
  'fastapi', 'pandas', 'numpy', 'kubernetes', 'docker', 'aws',
  'typescript', 'javascript', 'go', 'rust', 'java', 'spring'
];

const DOCUMENTATION_TYPES = ['api', 'guide', 'tutorial', 'examples', 'best-practices'];
const OUTPUT_FORMATS = ['json', 'markdown', 'text'];

/**
 * Context7 Documentation Search
 */
class Context7DocsSearch {
  constructor() {
    this.config = CONTEXT7_CONFIG;
  }

  /**
   * Parse command line arguments
   */
  parseArgs(args) {
    const queryIndex = args.findIndex(arg => !arg.startsWith('--'));
    const query = queryIndex >= 0 ? args[queryIndex] : null;

    const parsed = {
      query: query,
      library: null,
      type: null,
      version: null,
      topic: null,
      output: null,
      format: 'markdown',
      count: 10,
      help: false
    };

    for (let i = 2; i < args.length; i++) {
      const arg = args[i];

      switch (arg) {
        case '--library':
        case '-l':
          parsed.library = args[++i];
          break;
        case '--type':
        case '-t':
          parsed.type = args[++i];
          break;
        case '--version':
        case '-v':
          parsed.version = args[++i];
          break;
        case '--topic':
          parsed.topic = args[++i];
          break;
        case '--output':
        case '-o':
          parsed.output = args[++i];
          break;
        case '--format':
        case '-f':
          parsed.format = args[++i];
          break;
        case '--count':
        case '-c':
          parsed.count = parseInt(args[++i], 10);
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

    if (!args.query) {
      errors.push('Search query is required');
    }

    if (args.library && !LIBRARIES.includes(args.library.toLowerCase())) {
      console.warn(`Warning: ${args.library} may not be in the supported library list`);
    }

    if (args.type && !DOCUMENTATION_TYPES.includes(args.type)) {
      errors.push(`Invalid type: ${args.type}. Supported: ${DOCUMENTATION_TYPES.join(', ')}`);
    }

    if (!OUTPUT_FORMATS.includes(args.format)) {
      errors.push(`Invalid format: ${args.format}. Supported: ${OUTPUT_FORMATS.join(', ')}`);
    }

    if (args.count && (args.count < 1 || args.count > 50)) {
      errors.push('Count must be between 1 and 50');
    }

    return errors;
  }

  /**
   * Generate search request for context7-mcp
   */
  generateSearchRequest(args) {
    let searchQuery = args.query;

    // Enhance query with library and type
    if (args.library) {
      searchQuery = `${args.library} ${args.query}`;
    }

    if (args.type) {
      searchQuery += ` ${args.type}`;
    }

    if (args.topic) {
      searchQuery += ` ${args.topic}`;
    }

    return {
      jsonrpc: '2.0',
      id: 1,
      method: 'tools/call',
      params: {
        name: 'context7_search',
        arguments: {
          query: searchQuery,
          library: args.library,
          type: args.type,
          version: args.version,
          limit: args.count,
          include_code_examples: true,
          include_api_reference: true
        }
      }
    };
  }

  /**
   * Format search results
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
    let markdown = `# Documentation Search Results\n\n`;

    if (results.query) {
      markdown += `**Query:** ${results.query}\n\n`;
    }

    if (results.total) {
      markdown += `**Total Results:** ${results.total}\n\n`;
    }

    if (results.documents && results.documents.length > 0) {
      results.documents.forEach((doc, idx) => {
        markdown += `## ${idx + 1}. ${doc.title}\n\n`;
        markdown += `**Library:** ${doc.library || 'N/A'}\n`;
        markdown += `**Type:** ${doc.type || 'N/A'}\n`;
        markdown += `**URL:** ${doc.url || 'N/A'}\n\n`;

        if (doc.summary) {
          markdown += `### Summary\n${doc.summary}\n\n`;
        }

        if (doc.examples && doc.examples.length > 0) {
          markdown += `### Code Examples\n\n`;
          doc.examples.forEach((example, exIdx) => {
            markdown += `#### Example ${exIdx + 1}\n`;
            if (example.language) {
              markdown += `*Language: ${example.language}*\n\n`;
            }
            markdown += '```' + (example.language || '') + '\n';
            markdown += example.code + '\n';
            markdown += '```\n\n';

            if (example.description) {
              markdown += `${example.description}\n\n`;
            }
          });
        }

        if (doc.api_reference) {
          markdown += `### API Reference\n\n`;
          markdown += '```json\n';
          markdown += JSON.stringify(doc.api_reference, null, 2);
          markdown += '\n```\n\n';
        }

        markdown += '---\n\n';
      });
    }

    return markdown;
  }

  /**
   * Convert to text format
   */
  toText(results) {
    let text = `Documentation Search Results\n`;
    text += '='.repeat(70) + '\n\n`;

    if (results.query) {
      text += `Query: ${results.query}\n`;
    }

    if (results.total) {
      text += `Total Results: ${results.total}\n\n`;
    }

    if (results.documents && results.documents.length > 0) {
      results.documents.forEach((doc, idx) => {
        text += `${idx + 1}. ${doc.title}\n`;
        text += `   Library: ${doc.library || 'N/A'}\n`;
        text += `   Type: ${doc.type || 'N/A'}\n`;
        text += `   URL: ${doc.url || 'N/A'}\n\n`;

        if (doc.summary) {
          text += `   Summary: ${doc.summary}\n\n`;
        }

        if (doc.examples && doc.examples.length > 0) {
          text += `   Examples: ${doc.examples.length} found\n\n`;
        }

        text += '\n';
      });
    }

    return text;
  }

  /**
   * Main search method
   */
  async search(args) {
    try {
      console.log('Starting Context7 documentation search...');
      console.log(`Query: ${args.query}`);
      if (args.library) console.log(`Library: ${args.library}`);
      if (args.type) console.log(`Type: ${args.type}`);
      if (args.version) console.log(`Version: ${args.version}`);
      console.log(`Count: ${args.count}`);
      console.log(`Format: ${args.format}`);
      console.log('');

      // Generate MCP request
      const request = this.generateSearchRequest(args);

      console.log('MCP Request:');
      console.log(JSON.stringify(request, null, 2));
      console.log('');

      // Mock response for demonstration
      const mockResults = {
        query: args.query,
        library: args.library,
        type: args.type,
        total: 1,
        documents: [
          {
            title: `Documentation for: ${args.query}`,
            library: args.library || 'General',
            type: args.type || 'guide',
            url: 'https://example.com/docs',
            summary: `This is example documentation for ${args.query}.`,
            examples: [
              {
                language: 'javascript',
                code: `// Example code for ${args.query}\nconsole.log('Hello, World!');`,
                description: 'Basic usage example'
              }
            ],
            api_reference: {
              methods: ['get', 'post', 'put', 'delete'],
              parameters: ['id', 'name', 'value']
            }
          }
        ]
      };

      const formatted = this.formatResults(mockResults, args.format);

      if (args.output) {
        fs.writeFileSync(args.output, formatted);
        console.log(`Results saved to: ${args.output}`);
      } else {
        console.log(formatted);
      }

      return mockResults;

    } catch (error) {
      console.error('Search failed:', error.message);
      if (error.message.includes('CONTEXT7_API_KEY')) {
        console.error('Please set the CONTEXT7_API_KEY environment variable');
      }
      process.exit(1);
    }
  }

  /**
   * Check API key configuration
   */
  checkApiKey() {
    const apiKey = process.env.CONTEXT7_API_KEY;
    if (!apiKey) {
      console.warn('WARNING: CONTEXT7_API_KEY environment variable is not set');
      console.warn('Get your API key from Context7 service');
      console.warn('Export it with: export CONTEXT7_API_KEY=your_key_here');
      return false;
    }
    console.log('✓ Context7 API key configured');
    return true;
  }

  /**
   * Show supported libraries
   */
  showLibraries() {
    console.log('\nSupported Libraries:');
    LIBRARIES.forEach(lib => console.log(`  - ${lib}`));
    console.log('');
  }
}

// Main execution
if (require.main === module) {
  const search = new Context7DocsSearch();
  const args = search.parseArgs(process.argv);

  if (args.help) {
    console.log(`
Context7 MCP Documentation Search

Usage:
  node search-docs.js "your search query" [options]

Options:
  --library, -l <lib>     Library name: ${LIBRARIES.join(', ')}
  --type, -t <type>       Documentation type: ${DOCUMENTATION_TYPES.join(', ')}
  --version, -v <version> Specific version
  --topic <topic>         Specific topic
  --count, -c <number>    Number of results (1-50, default: 10)
  --output, -o <path>     Save results to file
  --format, -f <format>   Output format: ${OUTPUT_FORMATS.join(', ')} (default: markdown)
  --help, -h              Show this help message

Examples:
  # Search React hooks
  node search-docs.js "useState hook" --library React --type api

  # Find Python database examples
  node search-docs.js "database transactions" --library Python --type examples

  # Get Kubernetes guides
  node search-docs.js "deployment strategies" --library Kubernetes --type guide

  # Save to file
  node search-docs.js "async await patterns" --output async-patterns.md

  # Search with version
  node search-docs.js "components" --library React --version 18 --type api

Environment Variables:
  CONTEXT7_API_KEY        Required: Your Context7 API key
                           Get it from: Context7 service
`);
    search.showLibraries();
    process.exit(0);
  }

  // Check API key
  search.checkApiKey();
  console.log('');

  const errors = search.validateArgs(args);
  if (errors.length > 0) {
    console.error('Validation errors:');
    errors.forEach(err => console.error(`  - ${err}`));
    console.error('\nUse --help for usage information');
    process.exit(1);
  }

  search.search(args);
}

module.exports = Context7DocsSearch;
