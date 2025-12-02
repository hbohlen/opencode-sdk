#!/bin/bash

# OpenCode Web UI Deployment Script
# This script deploys the web UI to a VPS server

set -e

# Configuration - Update these values
REMOTE_HOST="your-server.com"  # Replace with your server
REMOTE_USER="root"             # Replace with your username
REMOTE_PATH="/var/www/opencode-web-ui"  # Deployment path on server
DOMAIN="your-domain.com"        # Replace with your domain

echo "🚀 Starting OpenCode Web UI deployment..."

# Build the application
echo "📦 Building application..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Aborting deployment."
    exit 1
fi

echo "✅ Build successful!"

# Create deployment directory structure
echo "📁 Creating deployment package..."
TEMP_DIR=$(mktemp -d)
cp -r dist/* $TEMP_DIR/
cp nginx.conf $TEMP_DIR/

# Create deployment script for remote server
cat > $TEMP_DIR/deploy-remote.sh << 'EOF'
#!/bin/bash
set -e

# Install nginx if not present
if ! command -v nginx &> /dev/null; then
    echo "📦 Installing nginx..."
    apt-get update
    apt-get install -y nginx
fi

# Create deployment directory
mkdir -p /var/www/opencode-web-ui

# Copy files
echo "📋 Copying files..."
cp -r ./* /var/www/opencode-web-ui/

# Update nginx configuration
echo "⚙️  Configuring nginx..."
cp nginx.conf /etc/nginx/sites-available/opencode-web-ui
ln -sf /etc/nginx/sites-available/opencode-web-ui /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test nginx configuration
nginx -t

# Restart nginx
systemctl restart nginx

echo "✅ Deployment complete!"
EOF

chmod +x $TEMP_DIR/deploy-remote.sh

# Deploy to remote server
echo "🌐 Deploying to remote server..."
rsync -avz --delete $TEMP_DIR/ $REMOTE_USER@$REMOTE_HOST:$REMOTE_PATH/

# Execute remote deployment script
echo "🔧 Running remote deployment..."
ssh $REMOTE_USER@$REMOTE_HOST "cd $REMOTE_PATH && ./deploy-remote.sh"

# Cleanup
rm -rf $TEMP_DIR

echo "🎉 Deployment completed successfully!"
echo "📱 Your OpenCode Web UI should now be available at: https://$DOMAIN"
echo ""
echo "📝 Next steps:"
echo "   1. Update your DNS to point $DOMAIN to $REMOTE_HOST"
echo "   2. Configure SSL certificate (optional but recommended)"
echo "   3. Update the nginx.conf file with your actual domain"
echo "   4. Test the deployment by visiting https://$DOMAIN"