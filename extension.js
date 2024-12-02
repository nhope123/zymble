// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const generateComponent = require('./commands/createComponent/generateComponent');
const generateHook = require('./commands/createHooks/generateHook');

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
const activate = (context) => {
	context.subscriptions.push(
		vscode.commands.registerCommand(
			'zymble.createComponent',
			generateComponent
		)
	);

	context.subscriptions.push(
		vscode.commands.registerCommand(
			'zymble.createHook',
			generateHook
		)
	);
};

// This method is called when your extension is deactivated
const deactivate = () => {};

module.exports = {
	activate,
	deactivate,
};
