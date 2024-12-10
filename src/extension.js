const vscode = require('vscode');
const generateComponent = require('./commands/createComponent/generateComponent');
const generateHook = require('./commands/createHooks/generateHook');
const { updateContextMenu } = require('./commands/vscodeHelper/vscodeHelpers');
const generatePrettierConfig = require('./commands/setupPrettier/generatePrettierConfig');

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
const activate = (context) => {
  updateContextMenu();

  context.subscriptions.push(
    vscode.commands.registerCommand('zymble.createComponent', generateComponent)
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('zymble.createHook', generateHook)
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      'zymble.addPrettierConfig',
      generatePrettierConfig
    )
  );
};

// This method is called when your extension is deactivated
const deactivate = () => {};

module.exports = {
  activate,
  deactivate,
};
