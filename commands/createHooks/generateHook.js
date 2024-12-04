const fs = require('fs');
const path = require('path');
const vscode = require('vscode');
const {
	createFilesWithContent,
	findDirectory,
	getComponentName,
	getCurrentWorkspaceFolders,
	getTargetFolder,
	showErrorMessage,
	showQuickPick,
	processContextMenuPath,
} = require('../vscodeHelpers.js');
const generateHookFiles = require('./hookTemplateUtils.js');

const regex = /^use/i;

const generateHook = async (uri) => {
	try {
		const workspaceFolders = getCurrentWorkspaceFolders()[0].uri.fsPath;		

		// Get hook name
		let hookName = await getComponentName({
			prompt: 'Enter Hook Name. (eg. State)',
			title: 'Hook Name',
			},
			'Hook Name cannot be empty'
		);

		if (hookName) {
			if (regex.test(hookName)) {
				hookName = 'use' + hookName.charAt(3).toLowerCase() + hookName.slice(4);
			} else {
				hookName = 'use' + hookName;
			}
		} else if (!hookName) {
			throw new Error('Operation cancelled: Unsatisfied hook name.');
		}

		const hasUseState =
			(await showQuickPick(['Yes', 'No'], 'Should have useState?')) === 'Yes';
		const hasUseEffect =
			(await showQuickPick(['Yes', 'No'], 'Should have useEffect?')) === 'Yes';

		// Get destination folder
		const menuContextPath = processContextMenuPath(uri);
		let hooksFolder;
		if(menuContextPath) {
			hooksFolder = menuContextPath;
		}else {
			hooksFolder = await findDirectory(
				workspaceFolders,
				'hooks'
			);
	
			if (!hooksFolder) {
				hooksFolder = await getTargetFolder([
					{
						path: path.resolve(workspaceFolders, 'src/hooks'),
						option: 'src/hooks',
					},
				]);
	
				if (!hooksFolder) {
					const targetError = 'Operation cancelled: Target folder error.';
					console.error(targetError);					
					throw new Error(targetError);					
				}
			}
		}
		

		// Create the folder for the new component
		const componentFolderPath = path.join(hooksFolder, hookName);
		fs.mkdirSync(componentFolderPath, { recursive: true });

		// generate hook files
		const files = await generateHookFiles(hookName, hasUseState, hasUseEffect);

		// Create each file with its corresponding content
		createFilesWithContent(componentFolderPath, files);

		vscode.window.showInformationMessage(
			`Custom hook ${hookName} created successfully!`
		);
	} catch (error) {
		showErrorMessage(error.message);
	}
};

module.exports = generateHook;
