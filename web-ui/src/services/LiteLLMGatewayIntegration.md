# LiteLLM Gateway Integration

## Overview

The LiteLLM Gateway integration provides a solution for connecting to AI providers that have CORS restrictions or other connectivity issues when accessed directly from the browser, such as Z.ai's API.

## Architecture

The implementation follows a layered architecture:

1. **Frontend (Browser)**: Enhanced provider management with routing capabilities
2. **Gateway (Backend Service)**: LiteLLM service that handles requests to problematic providers
3. **AI Providers**: Various AI services like OpenAI, Anthropic, Z.ai, etc.

## Configuration

Providers can be configured with different routing methods:

- `auto`: Test both direct and gateway methods, use the successful one
- `direct`: Attempt direct connection to the provider
- `gateway`: Always route through the LiteLLM gateway

## Z.ai Configuration

For Z.ai specifically, the implementation includes:

- Pre-configured template with gateway routing
- Custom headers for Z.ai API compatibility
- Health monitoring to track connection status

## Backend Gateway Setup

To use the LiteLLM gateway functionality, you need to set up a backend service. This is typically done using the LiteLLM Python package:

```bash
pip install litellm
```

Then run LiteLLM as a proxy server:

```bash
litellm --port 4000 --model zai_model=openai/zai_model --api_base https://api.z.ai/api/coding/paas/v4
```

Or use the proxy configuration:

```yaml
model_list:
  - model_name: zai-coding-model
    litellm_params:
      model: openai/zai-coding-model
      api_base: https://api.z.ai/api/coding/paas/v4
      api_key: sk-1234
```

## Environment Variables

Configure the gateway endpoint in your environment:

```
LITELLM_GATEWAY_ENDPOINT=http://localhost:4000
```

## Model Discovery

The system supports model discovery through both direct and gateway routes. Providers configured to use gateway routing will have their models discovered through the LiteLLM service.

## Health Monitoring

Continuous health monitoring checks the connectivity status of each provider and updates the UI accordingly. Providers with repeated failures are marked as degraded.

## Backward Compatibility

All existing provider configurations continue to work without modification. The routing method defaults to 'auto', which attempts direct connection first and falls back to gateway if configured and direct fails.

## Implementation Notes

- The frontend implementation handles routing decisions
- Direct API calls are made from the browser when possible
- Gateway requests are made to a backend service that handles the actual provider calls
- CORS restrictions are avoided by routing problematic providers through the backend gateway