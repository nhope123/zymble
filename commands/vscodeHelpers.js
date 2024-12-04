const path = require('path');
const vscode = require('vscode');
const fs = require('fs');

const SELECT_FOLDER_OPTION = 'Select Folder';
const CURRENT_FOLDER_OPTION = 'Current Folder';

const getCurrentWorkspaceFolders = () => {
  const workspaceFolders = vscode.workspace.workspaceFolders;

  if (!workspaceFolders) {
    throw new Error('Please open a folder first.');
  }
  return workspaceFolders;
};

const showQuickPick = async (options, placeHolder) => {
  return await vscode.window.showQuickPick(options, { placeHolder });
};

const showErrorMessage = async (message) =>
  await vscode.window.showErrorMessage(message);

const showInputBox = async (options, token) => {
  return await vscode.window.showInputBox(
    {
      validateInput: (value) => (value ? null : 'Input cannot be empty'),
      ...options,
    },
    token
  );
};

const findDirectory = async (startPath, folderName) => {
  try {
    const entries = await fs.promises.readdir(startPath, {
      withFileTypes: true,
    });

    for (const entry of entries) {
      const fullPath = path.join(startPath, entry.name);

      if (entry.isDirectory()) {
        if (entry.name === folderName) {
          return fullPath; // Folder found!
        }
        // Recursive search in subdirectories
        const result = await findDirectory(fullPath, folderName);
        if (result) {
          return result;
        }
      }
    }
  } catch (error) {
    console.error(`Error reading directory: ${startPath}`, error);
  }
  return undefined; // Folder not found
};

const getComponentName = async (options, errorMessage) => {
  // Prompt the user for the component name
  let componentName = await showInputBox(options);

  if (componentName) {
    componentName = componentName
      .replace(/[^a-zA-Z0-9]/g, ' ')
      .split(' ')
      .map((word) => word.charAt(0).toLocaleUpperCase() + word.slice(1))
      .join('');
    if (componentName.length > 0) {
      return componentName;
    }
  }
  throw new Error(errorMessage);
};

const getTargetFolder = async (options) => {
  const workspaceFolder = getCurrentWorkspaceFolders();

  // Get active window
  let activeFilePath = '';
  const activeEditor = vscode.window.activeTextEditor;
  if (activeEditor) {
    activeFilePath = activeEditor.document.uri.fsPath;
  }

  let folderOptions = [SELECT_FOLDER_OPTION];
  if (activeFilePath) {
    folderOptions.unshift(CURRENT_FOLDER_OPTION);
  }
  if (options) {
    folderOptions = [...options.map((i) => i.option), ...folderOptions];
  }

  // Let the user select a folder or use the active folder
  const selectedFolder = await showQuickPick(
    folderOptions,
    'Select the target folder'
  );

  let targetFolderPath = workspaceFolder[0].uri.fsPath; // Default to root folder

  if (selectedFolder === CURRENT_FOLDER_OPTION) {
    const activeEditor = vscode.window.activeTextEditor;
    if (activeEditor) {
      const activeFilePath = activeEditor.document.uri.fsPath;
      targetFolderPath = path.dirname(activeFilePath);
    }
  } else if (selectedFolder === SELECT_FOLDER_OPTION) {
    const folderUri = await vscode.window.showOpenDialog({
      canSelectFolders: true,
      canSelectFiles: false,
      canSelectMany: false,
      openLabel: 'Select a folder',
    });

    if (folderUri && folderUri[0]) {
      targetFolderPath = folderUri[0].fsPath;
    } else {
      vscode.window.showErrorMessage(
        'No folder selected. Operation cancelled.'
      );
      return;
    }
  } else if (options) {
    const selectedOptionPath = options.filter(
      (i) => i.option === selectedFolder
    )[0].path;
    if (selectedOptionPath) {
      targetFolderPath = selectedOptionPath;
    }
  }

  return targetFolderPath;
};

const createFilesWithContent = (folderPath, files) => {
  try {
    // Create each file with its corresponding content
    for (const [fileName, content] of Object.entries(files)) {
      const filePath = path.join(folderPath, fileName);
      fs.writeFileSync(filePath, content);
    }
  } catch (error) {
    throw new Error(error);
  }

  return;
};

const getFileType = async () => {
  try {
    const workspaceFolders = getCurrentWorkspaceFolders();

    if (workspaceFolders) {
      const packageJsonPath = path.join(
        workspaceFolders[0].uri.fsPath,
        'package.json'
      );
      if (fs.existsSync(packageJsonPath)) {
        const packageJson = JSON.parse(
          fs.readFileSync(packageJsonPath, 'utf8')
        );
        if (
          packageJson.devDependencies &&
          packageJson.devDependencies.typescript
        ) {
          return ['tsx', 'ts'];
        }
      }
    }
  } catch (err) {
    console.error('Failed to update context menu:', err);
  }

  return ['jsx', 'js'];
};

const updateContextMenu = () => {
  try {
    const workspaceFolders = getCurrentWorkspaceFolders();

    if (workspaceFolders) {
      const packageJsonPath = path.join(
        workspaceFolders[0].uri.fsPath,
        'package.json'
      );
      if (fs.existsSync(packageJsonPath)) {
        const packageJson = JSON.parse(
          fs.readFileSync(packageJsonPath, 'utf8')
        );
        if (packageJson.dependencies && packageJson.dependencies.react) {
          vscode.commands.executeCommand('setContext', 'isReactProject', true);
        } else {
          vscode.commands.executeCommand('setContext', 'isReactProject', false);
        }
      }
    }
  } catch (err) {
    console.error('Failed to update context menu:', err);
  }
};

const processContextMenuPath = (uri) => {
  if (!uri) return;
  try {
    return uri.fsPath && path.extname(uri.fsPath)
      ? path.dirname(uri.fsPath)
      : uri.fsPath;
  } catch (err) {
    console.error('Menu context path error: ', err);
  }
  return;
};

const createDirectory = async (path, name) => {
  try {
    if (fs.existsSync(path)) {
      const overwrite =
        (await showQuickPick(
          ['Yes', 'No'],
          `The folder ${name} already exists. Do you want to overwrite it?`
        )) === 'Yes';

      if (!overwrite) {
        throw new Error('Operation cancelled.');
      } else {
        fs.rmdirSync(path, { recursive: true });
      }
    } else {
      fs.mkdirSync(path, { recursive: true });
    }
  } catch (error) {
    console.error(error.message);
    throw new Error(error.message);
  }
};

module.exports = {
  createDirectory,
  createFilesWithContent,
  findDirectory,
  getComponentName,
  getCurrentWorkspaceFolders,
  getFileType,
  getTargetFolder,
  processContextMenuPath,
  showErrorMessage,
  showQuickPick,
  updateContextMenu,
};
