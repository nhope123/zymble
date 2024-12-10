const { processErrorMessage } = require('./message');
const {
  CONFIGURATION_CONSTANTS: {
    packageJson,
    yarnLock,
    packageLock,
    packageManagers: { yarn, npm },
  },
} = require('../../config/configurationConstants');
const child_process = require('child_process');
const vscode = require('vscode');
const fs = require('fs').promises;

const exclusionPath = '**/node_modules/**';

/**
 * Evaluates the specified dependencies against the provided package.json file.
 *
 * @param {string[]} dependencyArray - An array of dependency names to evaluate.
 * @param {Object} packageJson - The package.json object containing dependencies and devDependencies.
 * @returns {Object|null} An object mapping each dependency to its version or null if not found, or null if an error occurs.
 */
const evaluatePackageDependencies = (dependencyArray, packageJson) => {
  try {
    if (
      !packageJson ||
      !Array.isArray(dependencyArray) ||
      dependencyArray.length === 0
    ) {
      return {};
    }

    const { dependencies, devDependencies } = packageJson;
    return dependencyArray.reduce((results, dependency) => {
      results[dependency] =
        dependencies[dependency] || devDependencies[dependency] || null;
      return results;
    }, {});
  } catch (error) {
    processErrorMessage(
      `Error evaluating package dependencies: ${error.message}`,
      'minor'
    );
    return null;
  }
};

const loadJsonPackages = async () => {
  const packageFile = await vscode.workspace.findFiles(
    packageJson,
    exclusionPath
  );

  if (packageFile.length === 0) {
    throw new Error('Package.json file not found.');
  }

  return JSON.parse(await fs.readFile(packageFile[0].fsPath, 'utf8'));
};

const detectPackageManager = async () => {
  const existingYarn = await vscode.workspace.findFiles(
    `**${yarnLock}`,
    exclusionPath
  );
  if (existingYarn.length > 0) {
    return yarn;
  }
  const existingNpm = await vscode.workspace.findFiles(
    `**${packageLock}`,
    exclusionPath
  );
  if (existingNpm.length > 0) {
    return npm;
  }
  return null;
};

// Helper Function: Install Missing Dependencies
const installDependency = (workspacePath, packageManager, dependency) => {
  const command =
    packageManager === 'yarn'
      ? `yarn add -D ${dependency}`
      : `npm install --save-dev ${dependency}`;
  child_process.execSync(command, { cwd: workspacePath, stdio: 'inherit' });
};

module.exports = {
  evaluatePackageDependencies,
  loadJsonPackages,
  detectPackageManager,
  installDependency,
};
