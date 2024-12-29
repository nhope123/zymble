const sinon = require('sinon');
const assert = require('assert');
const vscode = require('vscode');
const {
  fetchWorkspaceFolders,
  findFiles,
} = require('../../commands/vscodeHelper/fileOperations');
const {
  processErrorMessage,
  showInformationMessage,
} = require('../../commands/vscodeHelper/message');
const {
  detectPackageManager,
  evaluatePackageDependencies,
  installDependency,
  loadJsonPackages,
} = require('../../commands/vscodeHelper/dependencies');
const {
  createConfigFile,
  promptForConfigOverride,
} = require('../../commands/setupPrettier/prettierConfigUtils');
const generatePrettierConfig = require('../../commands/setupPrettier/generatePrettierConfig');
const { describe, it, beforeEach, afterEach } = require('mocha');

describe('Generate Prettier Config', () => {
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('generatePrettierConfig', () => {
    let fetchWorkspaceFoldersStub,
      loadJsonPackagesStub,
      evaluatePackageDependenciesStub,
      detectPackageManagerStub,
      installDependencyStub,
      showQuickPickStub,
      createConfigFileStub,
      promptForConfigOverrideStub,
      processErrorMessageStub,
      showInformationMessageStub;

    beforeEach(() => {
      fetchWorkspaceFoldersStub = sandbox.stub(fetchWorkspaceFolders);
      loadJsonPackagesStub = sandbox.stub(loadJsonPackages);
      evaluatePackageDependenciesStub = sandbox.stub(evaluatePackageDependencies);
      detectPackageManagerStub = sandbox.stub(detectPackageManager);
      installDependencyStub = sandbox.stub(installDependency);
      showQuickPickStub = sandbox.stub(vscode.window, 'showQuickPick');
      createConfigFileStub = sandbox.stub(createConfigFile);
      promptForConfigOverrideStub = sandbox.stub(promptForConfigOverride);
      processErrorMessageStub = sandbox.stub(processErrorMessage);
      showInformationMessageStub = sandbox.stub(showInformationMessage);
    });

    it('should return if no workspace folders are found', async () => {
      fetchWorkspaceFoldersStub.returns([]);

      await generatePrettierConfig();

      assert(fetchWorkspaceFoldersStub.calledOnce);
    });

    it('should return if no package.json data is found', async () => {
      fetchWorkspaceFoldersStub.returns([{ uri: { fsPath: '/workspace' } }]);
      loadJsonPackagesStub.resolves(null);

      await generatePrettierConfig();

      assert(loadJsonPackagesStub.calledOnce);
    });

    it('should detect package manager and install Prettier if missing', async () => {
      fetchWorkspaceFoldersStub.returns([{ uri: { fsPath: '/workspace' } }]);
      loadJsonPackagesStub.resolves({ dependencies: {} });
      evaluatePackageDependenciesStub.resolves({ prettier: false });
      detectPackageManagerStub.resolves('npm');
      showQuickPickStub.resolves('Yes');
      installDependencyStub.resolves();

      await generatePrettierConfig();

      assert(detectPackageManagerStub.calledOnce);
      assert(installDependencyStub.calledOnceWith('prettier', 'npm'));
    });

    it('should create Prettier config file', async () => {
      fetchWorkspaceFoldersStub.returns([{ uri: { fsPath: '/workspace' } }]);
      loadJsonPackagesStub.resolves({ dependencies: {} });
      evaluatePackageDependenciesStub.resolves({ prettier: true });
      promptForConfigOverrideStub.resolves(true);
      createConfigFileStub.resolves();

      await generatePrettierConfig();

      assert(createConfigFileStub.calledOnce);
      assert(showInformationMessageStub.calledOnceWith('Prettier configuration created successfully!'));
    });

    it('should handle errors', async () => {
      fetchWorkspaceFoldersStub.returns([{ uri: { fsPath: '/workspace' } }]);
      loadJsonPackagesStub.rejects(new Error('load error'));

      await generatePrettierConfig();

      assert(processErrorMessageStub.calledOnceWith('load error', 'minor'));
    });
  });
});