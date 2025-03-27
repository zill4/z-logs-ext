#!/bin/bash

# Display info
echo "Building and packaging z-logs VS Code extension..."

# Compile the TypeScript code
echo "Compiling TypeScript..."
npm run compile

# Check if compilation was successful
if [ $? -ne 0 ]; then
  echo "Error: TypeScript compilation failed!"
  exit 1
fi

# Package the extension
echo "Packaging extension..."
npx vsce package

# Check if packaging was successful
if [ $? -ne 0 ]; then
  echo "Error: Extension packaging failed!"
  exit 1
fi

echo "Done! The .vsix file is ready to be installed in VS Code."
echo "To install, run: code --install-extension z-logs-*.vsix" 