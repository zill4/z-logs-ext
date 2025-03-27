# z-logs

A Visual Studio Code extension for viewing memory-mapped logs created by the `z-mmap-logger` Node.js package.

## Features

- Real-time log viewing for Node.js applications using z-mmap-logger
- Auto-scrolling to keep up with new logs
- Ability to pause and resume log monitoring
- View detailed context for log entries
- Color-coded log levels for better visibility

## Requirements

- Visual Studio Code 1.98.0 or higher
- A Node.js application using the `z-mmap-logger` package

## Installation

### From VS Code Marketplace

1. Open VS Code
2. Go to Extensions (or press `Ctrl+Shift+X`)
3. Search for "z-logs"
4. Click "Install"

### From VSIX File

1. Download the `.vsix` file from the [releases page](https://github.com/zill4/z-logs-ext/releases)
2. Open VS Code
3. Go to Extensions (or press `Ctrl+Shift+X`)
4. Click on the "..." menu in the top-right of the Extensions panel
5. Select "Install from VSIX..."
6. Choose the downloaded file

## Usage

1. Start your Node.js application that uses `z-mmap-logger`
2. In VS Code, open the folder containing your application
3. Click the "z-logs" icon in the status bar, or use the "Show Z-Logs" command from the Command Palette (`Ctrl+Shift+P`)
4. The logs viewer will open and display logs from your application in real-time

### Commands

- **Show Z-Logs**: Opens the logs viewer panel

### Controls in the Logs Viewer

- **Clear**: Clears all currently displayed logs
- **Pause/Resume**: Pauses or resumes the log updates
- **Auto-scroll**: When checked, automatically scrolls to the newest logs

## How it Works

This extension reads the memory-mapped log file (`.z-logs/logs.mmap`) created by the `z-mmap-logger` package in your Node.js application. The log file is continuously updated by your application, and the extension polls for changes at regular intervals to display the latest logs.

## Troubleshooting

If you don't see any logs:

1. Make sure your Node.js application is running and using the `z-mmap-logger` package
2. Check that the `.z-logs` directory exists in your workspace
3. Verify that the `logs.mmap` file is being created inside the `.z-logs` directory

## Contributing

Contributions are welcome! Feel free to submit issues or pull requests on the [GitHub repository](https://github.com/zill4/z-logs-ext).

## License

This extension is licensed under [MIT License](LICENSE).
