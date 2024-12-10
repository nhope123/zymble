const { processErrorMessage, showQuickPick } = require('./message');
const vscode = require('vscode');
const path = require('path');
const fs = require('fs').promises;
const {
  CONFIGURATION_CONSTANTS: { packageJson, yesNoOptions },
  CURRENT_FOLDER_OPTION,
  SELECT_FOLDER_OPTION,
  CONFIRMATION_CHOICES,
} = require('../../config/configurationConstants');

const NO_FOLDER_SELECTED = 'No folder selected. Operation cancelled.';

/**
 * Creates a directory at the specified file path. If the directory already exists,
 * prompts the user to confirm whether to overwrite it.
 *
 * @param {string} filePath - The path where the directory should be created.
 * @param {string} name - The name of the directory.
 * @returns {Promise<void>} - A promise that resolves when the operation is complete.
 */
const createDirectory = async (filePath, name) => {
  try {
    const exists = await fs
      .access(filePath)
      .then(() => true)
      .catch(() => false);

    if (exists) {
      const overwrite =
        (await showQuickPick(CONFIRMATION_CHOICES, {
          placeholder: `The folder "${name}" already exists. Do you want to overwrite it?`,
          title: 'Overwrite Existing Folder',
        })) === yesNoOptions.yes;

      if (!overwrite) {
        processErrorMessage('Cancel folder override');
        return;
      }
      fs.rmdir(filePath, { recursive: true });
    } else {
      fs.mkdir(filePath, { recursive: true });
    }
  } catch (error) {
    processErrorMessage(error.message);
  }
};

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
 * Asynchronously creates multiple files with specified content in a given folder.
 *
 * @param {string} folderPath - The path to the folder where files will be created.
 * @param {Object.<string, string>} files - An object where keys are file names and values are file contents.
 * @returns {Promise<void>} A promise that resolves when all files have been created.
 * @throws {Error} If an error occurs during file creation.
 */
const createFilesWithContent = async (folderPath, files) => {
  try {
    // Create each file with its corresponding content
    for (const [fileName, content] of Object.entries(files)) {
      const filePath = path.join(folderPath, fileName);
      fs.writeFile(filePath, content);
    }

    // await Promise.all(fileWritePromises);
  } catch (error) {
    processErrorMessage(`Failed to create files: ${error.message}`);
  }
};

/**
 * Recursively searches for a directory with the specified name starting from the given path.
 *
 * @param {string} startPath - The path to start the search from.
 * @param {string} folderName - The name of the folder to find.
 * @returns {Promise<string|undefined>} - The full path of the found directory, or undefined if not found.
 */
const findDirectory = async (startPath, folderName) => {
  try {
    const entries = await fs.readdir(startPath, {
      withFileTypes: true,
    });

    for (const entry of entries) {
      const fullPath = path.join(startPath, entry.name);

      if (entry.isDirectory()) {
        if (entry.name === folderName) {
          return fullPath;
        }
        // Recursive search in subdirectories
        const result = await findDirectory(fullPath, folderName);
        if (result) {
          return result;
        }
      }
    }
  } catch (error) {
    processErrorMessage(
      `Error reading directory: ${startPath} ${error}`,
      'minor'
    );
    return;
  }
  return undefined;
};

/**
 * Retrieves the current workspace folders in VS Code.
 *
 * @returns {vscode.WorkspaceFolder[] | undefined} The array of workspace folders, or undefined if no folders are open.
 * @throws Will call processErrorMessage if no folders are open.
 */
const fetchWorkspaceFolders = () => {
  const workspaceFolders = vscode.workspace.workspaceFolders;

  if (!workspaceFolders) {
    processErrorMessage('Please open a folder first.');
    return;
  }
  return workspaceFolders;
};

/**
 * Determines the file types based on the presence of TypeScript in devDependencies.
 *
 * @returns {Promise<string[]>} A promise that resolves to an array of file extensions.
 * @throws Will throw an error if loading JSON packages fails.
 */
const getFileType = async () => {
  try {
    const typescript = ['tsx', 'ts'];
    const javascript = ['jsx', 'js'];
    const exclusionPath = '**/node_modules/**';

    const [tsFiles, jsonPackageFiles] = await Promise.all([
      vscode.workspace.findFiles('**/*.ts*', exclusionPath),
      vscode.workspace.findFiles(packageJson, exclusionPath),
    ]);

    if (tsFiles.length > 0) {
      return typescript;
    }

    if (jsonPackageFiles.length > 0) {
      const jsonData = JSON.parse(
        await fs.readFile(jsonPackageFiles[0].fsPath, 'utf8')
      );
      if (jsonData.devDependencies && jsonData.devDependencies.typescript) {
        return typescript;
      }
    }

    return javascript;
  } catch (err) {
    processErrorMessage(
      `Failed to determine file type: ${err.message}`,
      'minor'
    );
  }
};

/**
 * Retrieves the target folder based on user selection or active file.
 *
 * @param {Array<{option: string, path: string}>} [options] - Additional folder options for selection.
 * @returns {Promise<string>} The path of the selected target folder.
 */
const getTargetFolder = async (options) => {
  const workspaceFolders = fetchWorkspaceFolders();
  const workspaceFolder = workspaceFolders[0].uri.fsPath; // Default to root folder

  // Get active window
  const activeEditor = vscode.window.activeTextEditor;
  const activeFilePath = activeEditor ? activeEditor.document.uri.fsPath : '';

  // Get folder options
  const folderOptions = [
    ...(activeFilePath ? [CURRENT_FOLDER_OPTION] : []),
    SELECT_FOLDER_OPTION,
    ...(options ? options.map((i) => i.option) : []),
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

const findFiles = async (name, excludes) => {
  return vscode.workspace.findFiles(name, excludes);
};

module.exports = {
  createDirectory,
  createFileObject,
  createFilesWithContent,
  findDirectory,
  fetchWorkspaceFolders,
  getFileType,
  getTargetFolder,
  findFiles,
};
