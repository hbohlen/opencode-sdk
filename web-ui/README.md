# OpenCode Web UI

A web-based user interface for the opencode.ai SDK using TypeScript and React.

## Overview

The OpenCode Web UI provides a browser-based interface to interact with OpenCode capabilities. This web application can be run on a VPS server and accessed via URL, allowing users to interact with OpenCode without using the terminal.

## Features

- Chat interface for interacting with OpenCode
- Provider configuration (base URL, API keys, custom headers)
- Model selection interface
- Settings panel for configuration
- Responsive design for desktop and mobile access

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn package manager

## Setup and Development

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser to [http://localhost:5173](http://localhost:5173)

## Production Build

To create a production build:

```bash
npm run build
```

The build artifacts will be placed in the `dist/` directory.

## VPS Deployment

1. After building, copy the contents of the `dist/` folder to your web server's public directory.

2. Configure your web server (e.g., nginx) to serve the static files:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        root /path/to/your/dist/folder;
        try_files $uri $uri/ /index.html;
    }
}
```

3. For HTTPS, you can use Let's Encrypt or your preferred SSL certificate provider.

## Configuration

To configure the OpenCode provider:

1. Click the "Settings" button in the top right corner of the chat interface
2. Go to the "Providers" tab
3. Enter your provider's base URL and API key
4. Click "Save Configuration"

## Customization

The UI uses Tailwind CSS for styling. You can customize the look and feel by modifying:
- `src/index.css` - Main styles
- Component files in `src/components/`
- `tailwind.config.js` - Tailwind configuration

## Architecture

- **React 18** with TypeScript for type safety
- **Vite** for fast development and optimized builds
- **Tailwind CSS** for rapid UI development
- **@opencode-ai/sdk** for OpenCode functionality

## Components

- `ChatInterface`: Main chat UI with message history and input
- `SettingsPanel`: Configuration panel for providers and models
- `OpenCodeProvider`: Context provider for OpenCode SDK integration

## Environment Variables

Currently, the application doesn't use environment variables hardcoded in the build. Configuration is done through the UI.

## Troubleshooting

- If you encounter issues with API calls, make sure your OpenCode provider supports CORS requests from your domain.
- Check browser console for any error messages when troubleshooting.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Commit your changes (`git commit -m 'Add some amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.