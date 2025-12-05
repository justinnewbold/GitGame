#!/bin/bash
#
# Setup Git Hooks for GitGame
# This script configures Git to use the custom hooks in .githooks/
#

echo "🔧 Setting up Git hooks for GitGame..."

# Check if we're in a Git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo "❌ Error: Not a Git repository"
    exit 1
fi

# Configure Git to use .githooks directory
git config core.hooksPath .githooks

if [ $? -eq 0 ]; then
    echo "✅ Git hooks configured successfully!"
    echo ""
    echo "The following hooks are now active:"
    echo "  • pre-commit: Runs ESLint and tests before commits"
    echo ""
    echo "To disable hooks temporarily, use: git commit --no-verify"
else
    echo "❌ Failed to configure Git hooks"
    exit 1
fi
