const {
  fetchWorkspaceFolders,
  findFiles,
} = require('../vscodeHelper/fileOperations');
const {
  processErrorMessage,
  showInformationMessage,
} = require('../vscodeHelper/message');
const {
  detectPackageManager,
  evaluatePackageDependencies,
  installDependency,
  loadJsonPackages,
} = require('../vscodeHelper/dependencies');
const {
  CONFIGURATION_CONSTANTS: { react, typescript },
} = require('../../config/configurationConstants');
const {
  PRETTIER_CONSTANTS: { prettier },
} = require('../../config/prettierConstants');
const vscode = require('vscode');
const {
  createConfigFile,
  promptForConfigOverride,
} = require('./prettierConfigUtils');
const fs = require('fs/promises');

const exclusionPath = '**/node_modules/**';

/**
 * Sets up the Prettier configuration for the workspace.
 *
 * @param {Object} args - The arguments for the setup process.
 * @returns {Promise<void>} - A promise that resolves when the setup is complete.
 */
const generatePrettierConfig = async () => {
  try {
    // Check for workspace
    const workspaceFolders = fetchWorkspaceFolders();
    if (workspaceFolders.length === 0) return;

    const workspacePath = workspaceFolders[0].uri.fsPath;
    const packageJsonData = await loadJsonPackages();
    if (!packageJsonData) {
      return;
    }

    const { prettier: hasPrettier } = await evaluatePackageDependencies(
      [react, typescript, prettier],
      packageJsonData
    );

    // Detect package manager
    const packageManager = await detectPackageManager();
    if (!packageManager && packageJsonData) {
      const choice = await vscode.window.showQuickPick(['yarn', 'npm'], {
        placeHolder: 'No package manager detected. Choose one to proceed.',
      });
      if (!choice) return;
      packageManager = choice;
    }

    // Install Prettier if missing
    if (!hasPrettier && packageJsonData) {
      const installChoice = await vscode.window.showQuickPick(['Yes', 'No'], {
        placeHolder:
          'Prettier is not installed. Do you want to install it now?',
      });
      if (installChoice === 'Yes') {
        await installDependency(
          workspacePath,
          packageManager,
          'prettier @types/prettier'
        );
      } else {
        processErrorMessage('Prettier is not installed, command cancelled.');
        return;
      }
    }

    // Confirm overwriting existing config
    const existingConfig = await findFiles('**/*prettier*', exclusionPath);
    const packageJsonConfig = packageJsonData.prettier ?? false;
    if (existingConfig.length > 0 || packageJsonConfig) {
      if (!(await promptForConfigOverride())) {
        return;
      }
      if (packageJsonConfig) {
        delete packageJsonData.prettier;
        await fs.writeFile(
          path.join(workspacePath, 'package.json'),
          JSON.stringify(packageJsonData)
        );
      } else {
        await fs.rm(existingConfig[0].fsPath, { force: true });
      }
    }

    // Prompt user for config format
    const format = await vscode.window.showQuickPick(['json', 'yaml', 'js'], {
      placeHolder: 'Select the format for your Prettier configuration.',
    });
    if (!format) {
      processErrorMessage('Operation cancelled, file format required'); // system settings
    }

    // Generate and write the config file
    await createConfigFile(workspacePath, format);

    showInformationMessage('Prettier configuration complete!');
  } catch (error) {
    processErrorMessage(error.message, 'minor');
    vscode.window.showErrorMessage(error.message);
  }
};

module.exports = generatePrettierConfig;
