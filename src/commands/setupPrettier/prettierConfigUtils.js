const { CONFIRMATION_CHOICES } = require('../../config/configurationConstants');

const { processErrorMessage, showQuickPick } = require('../vscodeHelper/message');
const {
  loadJsonPackages,
  evaluatePackageDependencies,
} = require('../vscodeHelper/dependencies');
const yaml = require('yaml');
const fs = require('fs').promises;
const path = require('path');
const vscode = require('vscode');

const basicPrettierConfig = {
  trailingComma: 'es5',
  printWidth: 80,
  tabWidth: 2,
  semi: true,
  singleQuote: true,
  arrowParens: 'always',
};

const reactConfig = {
  jsxSingleQuote: false,
};

const typescriptConfig = {
  overrides: [
    {
      files: '*.ts',
      options: {
        parser: 'typescript',
      },
    },
    {
      files: '*.tsx',
      options: {
        parser: 'typescript',
      },
    },
  ],
};

const getCommonJsConfig = (configs) => {
  let result = `module.exports = {\n`;
  for (const [key, value] of Object.entries(configs)) {
    result += `\t${key}: ${typeof value === 'object' ? JSON.stringify(value) : value},\n`;
  }
  result += '};';

  return result;
};

const getModuleConfig = (configs) => {
  let result = `export default {\n`;
  for (const [key, value] of Object.entries(configs)) {
    result += `\t${key}: ${typeof value === 'object' ? JSON.stringify(value) : value},\n`;
  }
  result += '};';

  return result;
};

const promptForConfigOverride = async () => {
  const overrideConfig =
    (await showQuickPick(CONFIRMATION_CHOICES, {
      placeholder: `Prettier config already exists. Override?`,
      title: 'Override Configuration',
    })) === yesNoOptions.yes;

  if (!overrideConfig) {
    processErrorMessage(`Operation cancelled Prettier config already exist!`);
    return false;
  }
  return true;
};

const generateConfigContent = async (workspace, format) => {
  try {
    const packageJsonData = await loadJsonPackages();

    if (packageJsonData) {
    }
    const { react: _react, typescript: _typescript } =
      await evaluatePackageDependencies(
        ['react', 'typescript', 'prettier'],
        packageJsonData
      );

    const hasReact = _react;
    const hasTypescript = _typescript;

    let config = {
      ...basicPrettierConfig,
      ...(hasReact ? reactConfig : {}),
      ...(hasTypescript ? typescriptConfig : {}),
    };

    const userPrettierSettings = vscode.workspace.getConfiguration().prettier ?? false;

    if (userPrettierSettings) {
      const confirmUseSettings = ( await showQuickPick(CONFIRMATION_CHOICES, {
        placeholder: "Do you want to use vscode Prettier configuration?",
        title: 'User Prettier Config',
      })) === yesNoOptions.yes;

      if (confirmUseSettings) {
        config = userPrettierSettings;
      }
    }

    const moduleType = packageJsonData.type ?? false;
    switch (format) {
      case 'json':
        return {
          content: JSON.stringify(config, null, 2),
          filePath: path.join(workspace, '.prettierrc.json'),
        };
      case 'yaml':
        return {
          content: yaml.stringify(config),
          filePath: path.join(workspace, '.prettier.yaml'),
        };
      default:
        const filePath = path.join(workspace, 'prettier.config.js');
        if (moduleType && moduleType === 'module') {
          return {
            content: getModuleConfig(config),
            filePath,
          };
        }
        return {
          content: getCommonJsConfig(config),
          filePath,
        };
    }
  } catch (error) {
    processErrorMessage(error.message);
    return;
  }
};

const createConfigFile = async (workspace, format) => {
  const file = await generateConfigContent(workspace, format);
  if (!file) {
    throw new Error('Create file error');
  }

  fs.writeFile(file.filePath, file.content);
};

module.exports = {
  basicPrettierConfig,
  promptForConfigOverride,
  createConfigFile,
};
