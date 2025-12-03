#!/usr/bin/env node
/**
 * Docling MCP Document Extractor
 *
 * This script provides a CLI interface for the docling-mcp-server
 * to extract structured data from documents (PDF, DOCX, HTML, images)
 *
 * Usage:
 *   node extract-document.js --input path/to/document.pdf --type table
 *   node extract-document.js --input path/to/document.pdf --type key-value
 *   node extract-document.js --input path/to/document.pdf --type all --output output.json
 */

const fs = require('fs');
const path = require('path');

// Configuration for docling-mcp-server
const DOCLING_CONFIG = {
  type: 'stdio',
  command: 'uvx',
  args: ['--from=docling-mcp', 'docling-mcp-server'],
  enabled: true
};

const SUPPORTED_TYPES = ['table', 'key-value', 'text', 'all', 'ocr'];
const SUPPORTED_FORMATS = ['json', 'markdown', 'csv'];

/**
 * Extract structured data from document using docling-mcp-server
 */
class DoclingExtractor {
  constructor() {
    this.config = DOCLING_CONFIG;
  }

  /**
   * Parse command line arguments
   */
  parseArgs(args) {
    const parsed = {
      input: null,
      type: 'all',
      format: 'json',
      output: null,
      help: false
    };

    for (let i = 2; i < args.length; i++) {
      const arg = args[i];
      const next = args[i + 1];

      switch (arg) {
        case '--input':
        case '-i':
          parsed.input = next;
          i++;
          break;
        case '--type':
        case '-t':
          parsed.type = next;
          i++;
          break;
        case '--format':
        case '-f':
          parsed.format = next;
          i++;
          break;
        case '--output':
        case '-o':
          parsed.output = next;
          i++;
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

    if (!args.input) {
      errors.push('Input file is required (use --input or -i)');
    } else if (!fs.existsSync(args.input)) {
      errors.push(`Input file not found: ${args.input}`);
    }

    if (!SUPPORTED_TYPES.includes(args.type)) {
      errors.push(`Invalid type: ${args.type}. Supported: ${SUPPORTED_TYPES.join(', ')}`);
    }

    if (!SUPPORTED_FORMATS.includes(args.format)) {
      errors.push(`Invalid format: ${args.format}. Supported: ${SUPPORTED_FORMATS.join(', ')}`);
    }

    return errors;
  }

  /**
   * Generate MCP request for docling extraction
   */
  generateExtractionRequest(inputPath, type, format) {
    const filename = path.basename(inputPath);
    const ext = path.extname(inputPath).toLowerCase();

    let extractionConfig = {};

    // Configure extraction based on type
    switch (type) {
      case 'table':
        extractionConfig = {
          extractTables: true,
          extractText: false,
          preserveStructure: true
        };
        break;
      case 'key-value':
        extractionConfig = {
          extractKeyValuePairs: true,
          extractText: false,
          detectForms: true
        };
        break;
      case 'text':
        extractionConfig = {
          extractText: true,
          extractTables: false,
          extractImages: false
        };
        break;
      case 'ocr':
        extractionConfig = {
          enableOCR: true,
          extractText: true,
          ocrLanguages: ['en']
        };
        break;
      case 'all':
      default:
        extractionConfig = {
          extractText: true,
          extractTables: true,
          extractKeyValuePairs: true,
          extractImages: true,
          preserveStructure: true
        };
        break;
    }

    return {
      jsonrpc: '2.0',
      id: 1,
      method: 'tools/call',
      params: {
        name: 'extract_document',
        arguments: {
          file_path: inputPath,
          extraction_type: type,
          output_format: format,
          config: extractionConfig
        }
      }
    };
  }

  /**
   * Format output based on requested format
   */
  formatOutput(data, format) {
    switch (format) {
      case 'json':
        return JSON.stringify(data, null, 2);
      case 'markdown':
        return this.toMarkdown(data);
      case 'csv':
        return this.toCSV(data);
      default:
        return data;
    }
  }

  /**
   * Convert data to Markdown format
   */
  toMarkdown(data) {
    let markdown = `# Document Extraction Results\n\n`;

    if (data.text) {
      markdown += `## Text Content\n\n${data.text}\n\n`;
    }

    if (data.tables && data.tables.length > 0) {
      markdown += `## Tables\n\n`;
      data.tables.forEach((table, idx) => {
        markdown += `### Table ${idx + 1}\n\n`;
        if (table.headers) {
          markdown += `| ${table.headers.join(' | ')} |\n`;
          markdown += `| ${table.headers.map(() => '---').join(' | ')} |\n`;
          table.rows.forEach(row => {
            markdown += `| ${row.join(' | ')} |\n`;
          });
        }
        markdown += `\n`;
      });
    }

    if (data.keyValuePairs) {
      markdown += `## Key-Value Pairs\n\n`;
      Object.entries(data.keyValuePairs).forEach(([key, value]) => {
        markdown += `- **${key}**: ${value}\n`;
      });
      markdown += '\n';
    }

    return markdown;
  }

  /**
   * Convert data to CSV format
   */
  toCSV(data) {
    let csv = '';

    if (data.tables && data.tables.length > 0) {
      data.tables.forEach((table, idx) => {
        csv += `Table ${idx + 1}\n`;
        if (table.headers) {
          csv += table.headers.join(',') + '\n';
          table.rows.forEach(row => {
            csv += row.map(cell => `"${cell}"`).join(',') + '\n';
          });
        }
        csv += '\n';
      });
    }

    return csv;
  }

  /**
   * Main extraction method
   */
  async extract(inputPath, type, format, outputPath) {
    try {
      console.log(`Starting document extraction...`);
      console.log(`Input: ${inputPath}`);
      console.log(`Type: ${type}`);
      console.log(`Format: ${format}`);
      console.log('');

      // Generate MCP request
      const request = this.generateExtractionRequest(inputPath, type, format);

      // TODO: Execute MCP request to docling-mcp-server
      // For now, return a placeholder
      console.log('MCP Request generated:');
      console.log(JSON.stringify(request, null, 2));

      // Mock response for demonstration
      const mockResponse = {
        success: true,
        data: {
          text: 'Extracted text content...',
          tables: [],
          keyValuePairs: {}
        }
      };

      const formattedOutput = this.formatOutput(mockResponse.data, format);

      if (outputPath) {
        fs.writeFileSync(outputPath, formattedOutput);
        console.log(`Output saved to: ${outputPath}`);
      } else {
        console.log(formattedOutput);
      }

      return mockResponse;

    } catch (error) {
      console.error('Extraction failed:', error.message);
      process.exit(1);
    }
  }
}

// Main execution
if (require.main === module) {
  const extractor = new DoclingExtractor();
  const args = extractor.parseArgs(process.argv);

  if (args.help) {
    console.log(`
Docling MCP Document Extractor

Usage:
  node extract-document.js [options]

Options:
  --input, -i <path>    Input document path (required)
  --type, -t <type>     Extraction type: ${SUPPORTED_TYPES.join(', ')} (default: all)
  --format, -f <format> Output format: ${SUPPORTED_FORMATS.join(', ')} (default: json)
  --output, -o <path>   Output file path (optional, prints to stdout if not specified)
  --help, -h            Show this help message

Examples:
  # Extract all data from PDF
  node extract-document.js --input document.pdf --type all

  # Extract only tables
  node extract-document.js --input invoice.pdf --type table --output invoice-tables.json

  # Extract key-value pairs
  node extract-document.js --input form.pdf --type key-value --format markdown

  # OCR scanned document
  node extract-document.js --input scan.jpg --type ocr --output text.txt
`);
    process.exit(0);
  }

  const errors = extractor.validateArgs(args);
  if (errors.length > 0) {
    console.error('Validation errors:');
    errors.forEach(err => console.error(`  - ${err}`));
    console.error('\nUse --help for usage information');
    process.exit(1);
  }

  extractor.extract(args.input, args.type, args.format, args.output);
}

module.exports = DoclingExtractor;
