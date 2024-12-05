const vscode = require('vscode');
/**
 * Processes an error message based on its severity.
 *
 * @param {string} message - The error message to process.
 * @param {string} [severity='sever'] - The severity of the error ('minor' or 'sever').
 * @throws {Error} Throws an error if the severity is 'sever'.
 */

const processErrorMessage = (message, severity = 'sever') => {
  if (severity === 'minor') {
    console.error(message);
    return;
  }
  console.error(message);
  throw new Error(message);
};

const showErrorMessage = async (message) =>
  await vscode.window.showErrorMessage(message);

const showInformationMessage = (message) =>
  vscode.window.showInformationMessage(message);

const showInputBox = async (options, token) => {
  return await vscode.window.showInputBox(
    {
      validateInput: (value) => (value ? null : 'Input cannot be empty'),
      ...options,
    },
    token
  );
};

const showQuickPick = async (items, options, token) => {
  return await vscode.window.showQuickPick(items, options, token);
};

module.exports = {
  processErrorMessage,
  showErrorMessage,
  showInformationMessage,
  showInputBox,
  showQuickPick,
};
