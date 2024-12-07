const { processErrorMessage } = require('./message');
const vscode = require('vscode');

/**
 * Creates a file object.
 *
 * @param name - File name without extension.
 * @param extension - File extension.
 * @param content - File content.
 * @returns An object with the file name and content.
 */
const createFileObject = (name, extension, content) => {
  if (!name || !extension) {
    processErrorMessage(
      'Create File Object Error: Missing file name or extension.'
    );
  }
  return {
    [`${name}.${extension}`]: content,
  };
};

/**
 * Retrieves the current workspace folders in VS Code.
 *
 * @returns {vscode.WorkspaceFolder[] | undefined} The array of workspace folders, or undefined if no folders are open.
 * @throws Will call processErrorMessage if no folders are open.
 */
const getCurrentWorkspaceFolders = () => {
  // console.log('shadow garden: ', vscode.workspace.getWorkspaceFolder());

  const workspaceFolders = vscode.workspace.workspaceFolders;

  if (!workspaceFolders) {
    processErrorMessage('Please open a folder first.');
  }
  return workspaceFolders;
};

module.exports = {
  createFileObject,
  getCurrentWorkspaceFolders,
};
