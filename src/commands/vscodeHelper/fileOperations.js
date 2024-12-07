const { processErrorMessage } = require('./message');
const vscode = require('vscode');

const NO_FOLDER_SELECTED = 'No folder selected. Operation cancelled.';

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
  const workspaceFolders = vscode.workspace.workspaceFolders;

  if (!workspaceFolders) {
    processErrorMessage('Please open a folder first.');
    return;
  }
  return workspaceFolders;
};

/**
 * Retrieves the target folder based on user selection or active file.
 *
 * @param {Array<{option: string, path: string}>} [options] - Additional folder options for selection.
 * @returns {Promise<string>} The path of the selected target folder.
 */
const getTargetFolder = async (options) => {
  const workspaceFolders = getCurrentWorkspaceFolders();
  const workspaceFolder = workspaceFolders[0].uri.fsPath; // Default to root folder

  // Get active window
  const activeEditor = vscode.window.activeTextEditor;
  const activeFilePath = activeEditor ? activeEditor.document.uri.fsPath : '';

   // Get folder options
   const folderOptions = [
    ...(activeFilePath ? [CURRENT_FOLDER_OPTION] : []),
    SELECT_FOLDER_OPTION,
    ...(options ? options.map((i) => i.option) : [])
  ];

  // Let the user select a folder or use the active folder
  const selectedFolder = await showQuickPick(folderOptions, {
    placeholder: 'Select the target folder',
  });

  
  if (!selectedFolder) { 
    processErrorMessage(NO_FOLDER_SELECTED);
    return;
  }

  if (selectedFolder === CURRENT_FOLDER_OPTION) {
    return activeFilePath ? path.dirname(activeFilePath) : workspaceFolder;
  }
  
  
  if (selectedFolder === SELECT_FOLDER_OPTION) {
    const folderUri = await vscode.window.showOpenDialog({
      canSelectFolders: true,
      canSelectFiles: false,
      canSelectMany: false,
      openLabel: 'Select a folder',
    });

    if (folderUri && folderUri[0]) {
      return folderUri[0].fsPath;
    } else {
      processErrorMessage(NO_FOLDER_SELECTED);
      return;
    }
  } 
  
  if (options) {
    const selectedOption = options.find((i) => i.option === selectedFolder);
    if (selectedOption) {
      return selectedOption.path;
    }
  }

  return workspaceFolder;
};

module.exports = {
  createFileObject,
  getCurrentWorkspaceFolders,
  getTargetFolder,
};
