#!/usr/bin/env node
/**
 * Brave Search MCP CLI
 *
 * Provides command-line interface for brave-search-mcp-server
 *
 * Usage:
 *   node web-search.js "search query" --count 10 --freshness m
 *   node web-search.js "AI trends" --output results.json
 */

const fs = require('fs');

// Configuration for brave-search-mcp-server
const BRAVE_SEARCH_CONFIG = {
  type: 'stdio',
  command: 'npx',
  args: ['-y', '@modelcontextprotocol/server-brave-search'],
  env: {
    BRAVE_API_KEY: '${env:BRAVE_API_KEY}'
  },
  enabled: true
};

const FRESHNESS_OPTIONS = ['d', 'w', 'm', 'y']; // day, week, month, year
const OUTPUT_FORMATS = ['json', 'text', 'csv'];

/**
 * Brave Search CLI wrapper
 */
class BraveSearchCLI {
  constructor() {
    this.config = BRAVE_SEARCH_CONFIG;
  }

  /**
   * Parse command line arguments
   */
  parseArgs(args) {
    const queryIndex = args.findIndex(arg => !arg.startsWith('--'));
    const query = queryIndex >= 0 ? args[queryIndex] : null;

    const parsed = {
      query: query,
      count: 10,
      freshness: null,
      output: null,
      format: 'json',
      help: false
    };

    for (let i = 2; i < args.length; i++) {
      const arg = args[i];

      switch (arg) {
        case '--count':
        case '-c':
          parsed.count = parseInt(args[++i], 10);
          break;
        case '--freshness':
        case '-f':
          parsed.freshness = args[++i];
          break;
        case '--output':
        case '-o':
          parsed.output = args[++i];
          break;
        case '--format':
          parsed.format = args[++i];
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

    if (args.count && (args.count < 1 || args.count > 100)) {
      errors.push('Count must be between 1 and 100');
    }

    if (args.freshness && !FRESHNESS_OPTIONS.includes(args.freshness)) {
      errors.push(`Freshness must be one of: ${FRESHNESS_OPTIONS.join(', ')}`);
    }

    if (args.output && fs.existsSync(args.output)) {
      console.warn(`Warning: Output file already exists: ${args.output}`);
    }

    return errors;
  }

  /**
   * Generate search request for brave-search-mcp
   */
  generateSearchRequest(query, count, freshness) {
    const request = {
      jsonrpc: '2.0',
      id: 1,
      method: 'tools/call',
      params: {
        name: 'brave_web_search',
        arguments: {
          query: query,
          count: count,
          search_lang: 'en',
          country: 'US',
          text_decorations: true,
          extra_params: {}
        }
      }
    };

    // Add freshness filter if specified
    if (freshness) {
      request.params.arguments.extra_params.search_filter = `freshness:${freshness}`;
    }

    return request;
  }

  /**
   * Format search results
   */
  formatResults(results, format) {
    switch (format) {
      case 'json':
        return JSON.stringify(results, null, 2);

      case 'text':
        let text = `Search Results (${results.web?.results?.length || 0} found)\n`;
        text += '='.repeat(60) + '\n\n';

        if (results.web?.results) {
          results.web.results.forEach((result, idx) => {
            text += `${idx + 1}. ${result.title}\n`;
            text += `   URL: ${result.url}\n`;
            text += `   Description: ${result.description}\n\n`;
          });
        }
        return text;

      case 'csv':
        let csv = 'Title,URL,Description\n';
        if (results.web?.results) {
          results.web.results.forEach(result => {
            const title = `"${(result.title || '').replace(/"/g, '""')}"`;
            const url = `"${(result.url || '').replace(/"/g, '""')}"`;
            const desc = `"${(result.description || '').replace(/"/g, '""')}"`;
            csv += `${title},${url},${desc}\n`;
          });
        }
        return csv;

      default:
        return results;
    }
  }

  /**
   * Main search method
   */
  async search(query, count, freshness, output, format) {
    try {
      console.log('Starting Brave Search...');
      console.log(`Query: ${query}`);
      console.log(`Count: ${count}`);
      if (freshness) console.log(`Freshness: ${freshness}`);
      console.log('');

      // Generate MCP request
      const request = this.generateSearchRequest(query, count, freshness);

      console.log('MCP Request:');
      console.log(JSON.stringify(request, null, 2));
      console.log('');

      // Mock response for demonstration
      const mockResults = {
        web: {
          results: [
            {
              title: `Result 1 for: ${query}`,
              url: 'https://example.com',
              description: 'This is a sample search result.',
              age: '2 days'
            },
            {
              title: `Result 2 for: ${query}`,
              url: 'https://example.org',
              description: 'Another sample result.',
              age: '1 week'
            }
          ]
        }
      };

      const formatted = this.formatResults(mockResults, format);

      if (output) {
        fs.writeFileSync(output, formatted);
        console.log(`Results saved to: ${output}`);
      } else {
        console.log(formatted);
      }

      return mockResults;

    } catch (error) {
      console.error('Search failed:', error.message);
      if (error.message.includes('BRAVE_API_KEY')) {
        console.error('Please set the BRAVE_API_KEY environment variable');
      }
      process.exit(1);
    }
  }

  /**
   * Check API key configuration
   */
  checkApiKey() {
    const apiKey = process.env.BRAVE_API_KEY;
    if (!apiKey) {
      console.warn('WARNING: BRAVE_API_KEY environment variable is not set');
      console.warn('Get your API key at: https://api.search.brave.com/');
      console.warn('Export it with: export BRAVE_API_KEY=your_key_here');
      return false;
    }
    console.log('✓ Brave Search API key configured');
    return true;
  }
}

// Main execution
if (require.main === module) {
  const cli = new BraveSearchCLI();
  const args = cli.parseArgs(process.argv);

  if (args.help) {
    console.log(`
Brave Search MCP CLI

Usage:
  node web-search.js "your search query" [options]

Options:
  --count, -c <number>    Number of results (1-100, default: 10)
  --freshness <period>    Time filter: ${FRESHNESS_OPTIONS.join(', ')} (day, week, month, year)
  --output, -o <path>     Save results to file
  --format <format>       Output format: ${OUTPUT_FORMATS.join(', ')} (default: json)
  --help, -h              Show this help message

Examples:
  # Basic search
  node web-search.js "AI model benchmarks 2024"

  # Search with options
  node web-search.js "React 18 new features" --count 20 --freshness y

  # Save results to file
  node web-search.js "TypeScript tutorial" --output typescript.json --format text

  # Get recent news
  node web-search.js "OpenAI news" --freshness d --count 5

Environment Variables:
  BRAVE_API_KEY          Required: Your Brave Search API key
                           Get it at: https://api.search.brave.com/
`);
    process.exit(0);
  }

  // Check API key
  cli.checkApiKey();
  console.log('');

  const errors = cli.validateArgs(args);
  if (errors.length > 0) {
    console.error('Validation errors:');
    errors.forEach(err => console.error(`  - ${err}`));
    console.error('\nUse --help for usage information');
    process.exit(1);
  }

  cli.search(args.query, args.count, args.freshness, args.output, args.format);
}

module.exports = BraveSearchCLI;
