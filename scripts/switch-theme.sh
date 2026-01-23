#!/bin/bash

# =============================================================================
# Theme Switcher Script for GitOps Demo
# =============================================================================
# Usage: ./scripts/switch-theme.sh [light|dark]
# =============================================================================

set -e

THEME="${1:-}"
CONFIGMAP_FILE="k8s/configmap.yaml"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print with color
print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Usage
usage() {
    echo "Usage: $0 [light|dark]"
    echo ""
    echo "Examples:"
    echo "  $0 light    # Switch to light theme"
    echo "  $0 dark     # Switch to dark theme"
    exit 1
}

# Validate input
if [[ -z "$THEME" ]]; then
    print_error "Theme not specified"
    usage
fi

if [[ "$THEME" != "light" && "$THEME" != "dark" ]]; then
    print_error "Invalid theme: $THEME"
    echo "Theme must be 'light' or 'dark'"
    usage
fi

# Check if configmap file exists
if [[ ! -f "$CONFIGMAP_FILE" ]]; then
    print_error "ConfigMap file not found: $CONFIGMAP_FILE"
    exit 1
fi

# Get current theme
CURRENT_THEME=$(grep 'THEME:' "$CONFIGMAP_FILE" | awk '{print $2}' | tr -d '"')
print_info "Current theme: $CURRENT_THEME"

# Check if already set to target theme
if [[ "$CURRENT_THEME" == "$THEME" ]]; then
    print_warning "Theme is already set to: $THEME"
    exit 0
fi

# Update the theme
print_info "Updating theme to: $THEME"
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    sed -i '' "s/THEME: \"$CURRENT_THEME\"/THEME: \"$THEME\"/" "$CONFIGMAP_FILE"
else
    # Linux
    sed -i "s/THEME: \"$CURRENT_THEME\"/THEME: \"$THEME\"/" "$CONFIGMAP_FILE"
fi
print_success "ConfigMap updated"

# Show the change
print_info "Git diff:"
git diff "$CONFIGMAP_FILE"

# Ask if user wants to commit
echo ""
read -p "Commit and push this change? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_info "Committing changes..."
    git add "$CONFIGMAP_FILE"
    git commit -m "feat: switch theme to $THEME

GitOps demo: Change application theme via ConfigMap.

Theme: $CURRENT_THEME -> $THEME
Deployment will be synced by ArgoCD."
    
    print_success "Changes committed"
    
    # Push
    read -p "Push to remote? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_info "Pushing to remote..."
        git push
        print_success "Changes pushed to remote"
        
        # Instructions for ArgoCD sync
        echo ""
        print_info "Next steps:"
        echo "  1. ArgoCD will detect the change (or run: argocd app sync ai-coderrank)"
        echo "  2. Restart the deployment: kubectl rollout restart deployment ai-coderrank -n ai-coderrank"
        echo "  3. Wait for rollout: kubectl rollout status deployment ai-coderrank -n ai-coderrank"
        echo "  4. Refresh your browser to see the new theme!"
        echo ""
        
        # Ask if user wants to restart deployment
        read -p "Restart deployment now? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            print_info "Restarting deployment..."
            kubectl rollout restart deployment ai-coderrank -n ai-coderrank
            print_success "Deployment restarting"
            
            print_info "Waiting for rollout to complete..."
            kubectl rollout status deployment ai-coderrank -n ai-coderrank
            print_success "Rollout complete! Check your browser for the new theme."
        fi
    fi
else
    print_warning "Changes not committed. You can commit manually later."
fi

print_success "Theme switch process complete!"
