const path = require('path');
const vscode = require('vscode');
const {
  CONFIGURATION_CONSTANTS: { prettier },
} = require('../../config/configurationConstants');
const { processErrorMessage, showInputBox } = require('./message');
const { loadJsonPackages } = require('./dependencies');

const exclusionPath = '**/node_modules/**';

const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

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
  processErrorMessage(`Get component name ${errorMessage}`);
  return;
};

const updateContextMenu = async () => {
  try {
    const packageJsonData = await loadJsonPackages();

    console.log('packages: ', packageJsonData);
    
    const { dependencies } = packageJsonData;
    if (dependencies && dependencies.react) {
      vscode.commands.executeCommand('setContext', 'isReactProject', true);
    } else {
      vscode.commands.executeCommand('setContext', 'isReactProject', false);
    }
    const hasPrettierConfiguration = vscode.workspace.findFiles(
      `**/${prettier}*`,
      exclusionPath
    );
    if (!hasPrettierConfiguration) {
      vscode.commands.executeCommand('setContext', 'noPrettierConfig', true);
    } else {
      vscode.commands.executeCommand('setContext', 'noPrettierConfig', false);
    }
  } catch (err) {
    processErrorMessage(`Update context menu ${err.message}`, 'minor');
  }
};

const processContextMenuPath = (uri) => {
  if (!uri) return;
  try {
    return uri.fsPath && path.extname(uri.fsPath)
      ? path.dirname(uri.fsPath)
      : uri.fsPath;
  } catch (err) {
    processErrorMessage(`Process context menu path ${err.message}`, 'minor');
  }
  return;
};

module.exports = {
  capitalize,
  getComponentName,
  processContextMenuPath,
  updateContextMenu,
};
