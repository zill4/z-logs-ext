"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = __importStar(require("vscode"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
function activate(context) {
    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('z-logs extension is now active!');
    // Register the command to show logs
    let disposable = vscode.commands.registerCommand('z-logs.showLogs', () => {
        // Create a webview panel
        const panel = vscode.window.createWebviewPanel('z-logs', 'z-logs Viewer', vscode.ViewColumn.One, {
            enableScripts: true,
            retainContextWhenHidden: true
        });
        // Set the webview's HTML content
        panel.webview.html = getWebviewContent();
        // Find the log file (assuming it's in the workspace)
        const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath || '.';
        const logDir = path.join(workspaceRoot, '.z-logs');
        const logFile = path.join(logDir, 'logs.mmap');
        if (!fs.existsSync(logDir)) {
            vscode.window.showErrorMessage('No .z-logs directory found. Make sure your application is running with z-mmap-logger.');
            return;
        }
        if (!fs.existsSync(logFile)) {
            vscode.window.showErrorMessage('logs.mmap file not found. Make sure your application is running with z-mmap-logger.');
            return;
        }
        // Since we can't use mmap-io directly due to compatibility issues, we'll read the file with regular fs
        let updateLogs = () => {
            try {
                const buffer = fs.readFileSync(logFile);
                if (buffer.length < 4) {
                    console.log('Log file is too small, waiting for data...');
                    return;
                }
                // Read the offset (first 4 bytes as uint32)
                const offset = buffer.readUInt32LE(0);
                console.log(`Read offset: ${offset}, buffer length: ${buffer.length}`);
                // Read the logs content
                if (offset > 4 && offset <= buffer.length) {
                    const content = buffer.slice(4, offset).toString('utf8');
                    console.log('Raw content:', content);
                    // Parse logs (each line is a JSON object)
                    const logs = content
                        .split('\n')
                        .filter(line => line.trim())
                        .map(line => {
                        try {
                            return JSON.parse(line);
                        }
                        catch (e) {
                            console.error('Failed to parse log line:', line);
                            return { level: 'error', message: `Failed to parse log: ${line}`, timestamp: new Date().toISOString() };
                        }
                    });
                    // Send to webview
                    panel.webview.postMessage({ command: 'updateLogs', logs });
                }
                else {
                    console.log('Invalid offset or no new logs');
                }
            }
            catch (error) {
                console.error('Error reading log file:', error);
            }
        };
        // Update logs initially
        updateLogs();
        // Set up polling to check for changes
        const interval = setInterval(updateLogs, 500);
        // Clean up on panel close
        panel.onDidDispose(() => {
            clearInterval(interval);
        });
    });
    // Register the status bar item for quick access
    const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBarItem.text = "$(eye) z-logs";
    statusBarItem.command = 'z-logs.showLogs';
    statusBarItem.tooltip = "View z-logs";
    statusBarItem.show();
    context.subscriptions.push(disposable, statusBarItem);
}
exports.activate = activate;
// This method is called when your extension is deactivated
function deactivate() { }
exports.deactivate = deactivate;
function getWebviewContent() {
    return `
	<!DOCTYPE html>
	<html lang="en">
	<head>
		<meta charset="UTF-8">
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		<title>z-logs Viewer</title>
		<style>
			body {
				font-family: var(--vscode-font-family);
				padding: 0;
				margin: 0;
				color: var(--vscode-foreground);
				background-color: var(--vscode-editor-background);
			}
			.controls {
				padding: 10px;
				display: flex;
				justify-content: space-between;
				border-bottom: 1px solid var(--vscode-panel-border);
			}
			.logs-container {
				overflow-y: auto;
				height: calc(100vh - 60px);
				padding: 10px;
			}
			.log-entry {
				margin-bottom: 10px;
				padding: 8px;
				border-radius: 4px;
				border-left: 4px solid transparent;
			}
			.log-info {
				border-left-color: #4080ff;
				background-color: rgba(64, 128, 255, 0.1);
			}
			.log-error {
				border-left-color: #ff4040;
				background-color: rgba(255, 64, 64, 0.1);
			}
			.log-warn {
				border-left-color: #ffbf40;
				background-color: rgba(255, 191, 64, 0.1);
			}
			.log-debug {
				border-left-color: #40bf40;
				background-color: rgba(64, 191, 64, 0.1);
			}
			.log-header {
				display: flex;
				justify-content: space-between;
				margin-bottom: 5px;
				font-weight: bold;
			}
			.log-message {
				margin-bottom: 5px;
				white-space: pre-wrap;
				word-break: break-word;
			}
			.log-details {
				display: none;
				background-color: var(--vscode-editor-background);
				padding: 8px;
				border-radius: 4px;
				margin-top: 5px;
				overflow-x: auto;
			}
			.btn {
				background-color: var(--vscode-button-background);
				color: var(--vscode-button-foreground);
				border: none;
				padding: 4px 8px;
				border-radius: 2px;
				cursor: pointer;
			}
			.btn:hover {
				background-color: var(--vscode-button-hoverBackground);
			}
			pre {
				margin: 0;
			}
		</style>
	</head>
	<body>
		<div class="controls">
			<div>
				<button class="btn" id="clearBtn">Clear</button>
				<button class="btn" id="pauseBtn">Pause</button>
			</div>
			<div>
				<label>
					<input type="checkbox" id="autoScroll" checked> Auto-scroll
				</label>
			</div>

		</div>
		<div class="logs-container" id="logsContainer"></div>

		<script>
			const vscode = acquireVsCodeApi();
			const logsContainer = document.getElementById('logsContainer');
			const clearBtn = document.getElementById('clearBtn');
			const pauseBtn = document.getElementById('pauseBtn');
			const autoScrollCheckbox = document.getElementById('autoScroll');
			
			let isPaused = false;
			let logs = [];

			// Handle messages from the extension
			window.addEventListener('message', event => {
				const message = event.data;
				if (message.command === 'updateLogs' && !isPaused) {
					logs = message.logs;
					renderLogs();
				}
			});

			// Clear logs
			clearBtn.addEventListener('click', () => {
				logs = [];
				renderLogs();
			});

			// Toggle pause
			pauseBtn.addEventListener('click', () => {
				isPaused = !isPaused;
				pauseBtn.textContent = isPaused ? 'Resume' : 'Pause';
			});

			// Function to render logs
			function renderLogs() {
				logsContainer.innerHTML = '';
				
				logs.forEach(log => {
					const logLevel = (log.level || 'info').toLowerCase();
					const logEntry = document.createElement('div');
					logEntry.className = \`log-entry log-\${logLevel}\`;
					
					const header = document.createElement('div');
					header.className = 'log-header';
					
					const levelSpan = document.createElement('span');
					levelSpan.textContent = logLevel.toUpperCase();
					
					const timeSpan = document.createElement('span');
					timeSpan.textContent = new Date(log.timestamp).toLocaleTimeString();
					
					header.appendChild(levelSpan);
					header.appendChild(timeSpan);
					logEntry.appendChild(header);
					
					const message = document.createElement('div');
					message.className = 'log-message';
					message.textContent = log.message;
					logEntry.appendChild(message);
					
					// Add request details if available
					if (log.request || log.context) {
						const detailsBtn = document.createElement('button');
						detailsBtn.className = 'btn';
						detailsBtn.textContent = 'Show Details';
						logEntry.appendChild(detailsBtn);
						
						const details = document.createElement('div');
						details.className = 'log-details';
						
						const pre = document.createElement('pre');
						pre.textContent = JSON.stringify(log.request || log.context, null, 2);
						details.appendChild(pre);
						logEntry.appendChild(details);
						
						detailsBtn.addEventListener('click', () => {
							if (details.style.display === 'block') {
								details.style.display = 'none';
								detailsBtn.textContent = 'Show Details';
							} else {
								details.style.display = 'block';
								detailsBtn.textContent = 'Hide Details';
							}
						});
					}
					
					logsContainer.appendChild(logEntry);
				});
				
				// Auto-scroll to bottom if enabled
				if (autoScrollCheckbox.checked) {
					logsContainer.scrollTop = logsContainer.scrollHeight;
				}
			}
		</script>
	</body>
	</html>
	`;
}
//# sourceMappingURL=extension.js.map