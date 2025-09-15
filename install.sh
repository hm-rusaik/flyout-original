#!/bin/bash

# Flyout App Installation Script
# This script helps install the Flyout app on a Frappe site

echo "🚀 Flyout App Installation Script"
echo "================================="

# Check if we're in a Frappe bench directory
if [ ! -f "common_site_config.json" ] && [ ! -d "sites" ]; then
    echo "❌ Error: This doesn't appear to be a Frappe bench directory."
    echo "Please run this script from your Frappe bench root directory."
    exit 1
fi

# Check if flyout app directory exists
if [ ! -d "apps/flyout" ]; then
    echo "❌ Error: Flyout app not found in apps directory."
    echo "Please ensure you have cloned the flyout app to apps/flyout"
    exit 1
fi

# Get site name from user
if [ -z "$1" ]; then
    echo "📝 Please provide the site name where you want to install Flyout."
    echo "Usage: ./install.sh <site-name>"
    echo ""
    echo "Available sites:"
    ls sites/ | grep -v "assets\|common_site_config.json\|apps.txt"
    exit 1
fi

SITE_NAME=$1

# Check if site exists
if [ ! -d "sites/$SITE_NAME" ]; then
    echo "❌ Error: Site '$SITE_NAME' not found."
    echo "Available sites:"
    ls sites/ | grep -v "assets\|common_site_config.json\|apps.txt"
    exit 1
fi

echo "📦 Installing Flyout app on site: $SITE_NAME"

# Install the app
echo "⚙️  Installing app..."
bench --site $SITE_NAME install-app flyout

if [ $? -eq 0 ]; then
    echo "✅ Flyout app installed successfully!"
    echo ""
    echo "🎉 Installation Complete!"
    echo "========================"
    echo "You can now:"
    echo "1. Access your site: http://$SITE_NAME"
    echo "2. Login with your administrator account"
    echo "3. Navigate to the Flyout module"
    echo ""
    echo "💡 Don't forget to restart your bench:"
    echo "   bench restart"
else
    echo "❌ Installation failed. Please check the error messages above."
    exit 1
fi



