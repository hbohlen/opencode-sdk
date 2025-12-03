import { ChatCompletionRequest } from 'openai/resources/chat';

/**
 * Translator for converting between OpenAI format and CLI arguments
 */
export class CLITranslator {
  /**
   * Convert OpenAI chat completion request to CLI arguments
   * @param request The OpenAI chat completion request
   * @param model The model to use (may be mapped to CLI-specific model)
   * @param additionalArgs Additional arguments specific to the CLI tool
   * @returns Array of CLI arguments
   */
  static openAIRequestToCLIArgs(
    request: ChatCompletionRequest,
    model: string,
    additionalArgs: string[] = []
  ): string[] {
    const args: string[] = [...additionalArgs];

    // Add model argument
    args.push('--model', model);

    // Add messages as prompt (for now, we'll combine all messages)
    const prompt = request.messages
      .map(msg => `${msg.role}: ${typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content)}`)
      .join('\n');

    args.push('--prompt', prompt);

    // Add temperature if specified
    if (request.temperature !== undefined) {
      args.push('--temperature', request.temperature.toString());
    }

    // Add max tokens if specified
    if (request.max_tokens !== undefined) {
      args.push('--max-tokens', request.max_tokens.toString());
    }

    // Add other common parameters
    if (request.top_p !== undefined) {
      args.push('--top-p', request.top_p.toString());
    }

    if (request.frequency_penalty !== undefined) {
      args.push('--frequency-penalty', request.frequency_penalty.toString());
    }

    if (request.presence_penalty !== undefined) {
      args.push('--presence-penalty', request.presence_penalty.toString());
    }

    return args;
  }

  /**
   * Parse CLI output to OpenAI-compatible format
   * @param cliOutput The raw output from CLI tool
   * @param model The model that was used
   * @param requestID Optional request ID to include in response
   * @returns OpenAI-compatible chat completion response
   */
  static cliOutputToOpenAIFormat(
    cliOutput: string,
    model: string,
    requestID?: string
  ): any { // Using any for now, would be the proper OpenAI response type
    // This is a simplified implementation - real implementation would parse
    // the specific output format of each CLI tool
    return {
      id: requestID || `chatcmpl-${Date.now()}`,
      object: 'chat.completion',
      created: Math.floor(Date.now() / 1000),
      model,
      choices: [
        {
          index: 0,
          message: {
            role: 'assistant',
            content: cliOutput
          },
          finish_reason: 'stop' // Simplified
        }
      ],
      usage: {
        prompt_tokens: 0, // Would need to calculate
        completion_tokens: 0, // Would need to calculate
        total_tokens: 0 // Would need to calculate
      }
    };
  }

  /**
   * Convert OpenAI chat completion request to CLI arguments for streaming
   * @param request The OpenAI chat completion request
   * @param model The model to use (may be mapped to CLI-specific model)
   * @param additionalArgs Additional arguments specific to the CLI tool
   * @returns Array of CLI arguments
   */
  static openAIRequestToCLIArgsForStreaming(
    request: ChatCompletionRequest,
    model: string,
    additionalArgs: string[] = []
  ): string[] {
    const args = this.openAIRequestToCLIArgs(request, model, additionalArgs);
    
    // Add streaming-specific arguments
    // This would be specific to each CLI tool
    args.push('--stream');
    
    return args;
  }
}