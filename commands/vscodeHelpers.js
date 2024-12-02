const path = require('path');
const vscode = require('vscode');
const fs = require('fs');

const SELECT_FOLDER_OPTION = 'Select Folder';
const CURRENT_FOLDER_OPTION = 'Current Folder';

const getCurrentWorkspaceFolders = () => {
	const workspaceFolders = vscode.workspace.workspaceFolders;

	if (!workspaceFolders) {
		vscode.window.showErrorMessage('Please open a folder first.');
	}
	return workspaceFolders;
};

const showQuickPick = async (options, placeHolder) => {
	return await vscode.window.showQuickPick(options, { placeHolder });
};

const showInputBox = async (prompt, invalidText) => {
	return await vscode.window.showInputBox({
		prompt,
		validateInput: (input) => (input ? null : invalidText),
	});
};

const findDirectory = async (name) => {
	const workspaceFolders = getCurrentWorkspaceFolders();
	if (!workspaceFolders) {
		return;
	}

	for (const folder of workspaceFolders) {
		const directory = await vscode.workspace.findFiles(
			new vscode.RelativePattern(folder, `**/${name}`)
		);
		if (directory.length > 0) {
			return directory[0].fsPath;
		}
	}

	return;
};

 const getComponentName = async (prompt, invalidText) => {
  // Prompt the user for the component name
  let componentName = await showInputBox(prompt, invalidText);

  if (!componentName) {
    return; // User canceled the input
  } else {
    componentName = componentName
      .replace(/[^a-zA-Z0-9]/g, ' ')
      .split(' ')
      .map((word) => word.charAt(0).toLocaleUpperCase() + word.slice(1))
      .join('');
  }

  return componentName;
};

 const getTargetFolder = async (options) => {
  const workspaceFolder = getCurrentWorkspaceFolders();
	if (!workspaceFolder) {
		return;
	}	

  // Get active window
  let activeFilePath = '';
  const activeEditor = vscode.window.activeTextEditor;
    if (activeEditor) {
      activeFilePath = activeEditor.document.uri.fsPath;
    }
  
  let folderOptions = [SELECT_FOLDER_OPTION];
  if (activeFilePath) { folderOptions.unshift(CURRENT_FOLDER_OPTION); }
  if (options) {
    folderOptions = [
      ...options.map((i) => i.option),
      ...folderOptions
    ];
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
  }
  else if (selectedFolder === SELECT_FOLDER_OPTION) {
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
	}
  else if (options) {
    const selectedOptionPath = options.filter((i) => i.option === selectedFolder)[0].path;
    if (selectedOptionPath) {targetFolderPath = selectedOptionPath;}
  }

  return targetFolderPath;
};

 const createFilesWithContent = (folderPath, files) => {
  // Create each file with its corresponding content
	for (const [fileName, content] of Object.entries(files)) {
		const filePath = path.join(folderPath, fileName);
		fs.writeFileSync(filePath, content);
	}

  return;
};

module.exports = {
	createFilesWithContent,
  getComponentName,
	getCurrentWorkspaceFolders,
	getTargetFolder,
	showQuickPick,
	findDirectory,
}