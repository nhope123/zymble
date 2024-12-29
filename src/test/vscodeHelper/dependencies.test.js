const sinon = require('sinon');
const assert = require('assert');
const vscode = require('vscode');
const fs = require('fs').promises;
const child_process = require('child_process');
const {
  evaluatePackageDependencies,
  loadJsonPackages,
  detectPackageManager,
  installDependency,
} = require('../../commands/vscodeHelper/dependencies');
const { processErrorMessage } = require('../../commands/vscodeHelper/message');
const { describe, it, beforeEach, afterEach } = require('mocha');

describe('Dependencies helper', () => {
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('evaluatePackageDependencies', () => {
    let loadJsonPackagesStub, detectPackageManagerStub, installDependencyStub, processErrorMessageStub;

    beforeEach(() => {
      loadJsonPackagesStub = sandbox.stub().resolves({ dependencies: {} });
      detectPackageManagerStub = sandbox.stub().resolves('npm');
      installDependencyStub = sandbox.stub();
      processErrorMessageStub = sandbox.stub(processErrorMessage);
    });

    it('should evaluate package dependencies and install missing ones', async () => {
      loadJsonPackagesStub.resolves({ dependencies: { 'missing-package': '^1.0.0' } });
      detectPackageManagerStub.resolves('npm');
      installDependencyStub.resolves();

      await evaluatePackageDependencies();

      assert(installDependencyStub.calledOnceWith(sinon.match.any, 'npm', 'missing-package'));
    });

    it('should handle errors and call processErrorMessage', async () => {
      loadJsonPackagesStub.rejects(new Error('load error'));

      const result = await evaluatePackageDependencies();

      assert(processErrorMessageStub.calledOnceWith('Error evaluating package dependencies: load error', 'minor'));
      assert.strictEqual(result, null);
    });
  });

  describe('loadJsonPackages', () => {
    let findFilesStub, readFileStub;

    beforeEach(() => {
      findFilesStub = sandbox.stub(vscode.workspace, 'findFiles');
      readFileStub = sandbox.stub(fs, 'readFile');
    });

    it('should load and parse package.json file', async () => {
      findFilesStub.resolves([{ fsPath: '/path/to/package.json' }]);
      readFileStub.resolves(JSON.stringify({ name: 'test-package' }));

      const result = await loadJsonPackages();

      assert.deepStrictEqual(result, { name: 'test-package' });
    });

    it('should throw error if package.json file not found', async () => {
      findFilesStub.resolves([]);

      await assert.rejects(loadJsonPackages(), new Error('Package.json file not found.'));
    });
  });

  describe('detectPackageManager', () => {
    let findFilesStub;

    beforeEach(() => {
      findFilesStub = sandbox.stub(vscode.workspace, 'findFiles');
    });

    it('should detect yarn as package manager', async () => {
      findFilesStub.withArgs('**/yarn.lock', sinon.match.any).resolves([{ fsPath: '/path/to/yarn.lock' }]);
      findFilesStub.withArgs('**/package-lock.json', sinon.match.any).resolves([]);

      const result = await detectPackageManager();

      assert.strictEqual(result, 'yarn');
    });

    it('should detect npm as package manager', async () => {
      findFilesStub.withArgs('**/yarn.lock', sinon.match.any).resolves([]);
      findFilesStub.withArgs('**/package-lock.json', sinon.match.any).resolves([{ fsPath: '/path/to/package-lock.json' }]);

      const result = await detectPackageManager();

      assert.strictEqual(result, 'npm');
    });

    it('should return null if no package manager is detected', async () => {
      findFilesStub.resolves([]);

      const result = await detectPackageManager();

      assert.strictEqual(result, null);
    });
  });

  describe('installDependency', () => {
    let execSyncStub;

    beforeEach(() => {
      execSyncStub = sandbox.stub(child_process, 'execSync');
    });

    it('should install dependency using yarn', () => {
      installDependency('/workspace', 'yarn', 'missing-package');

      assert(execSyncStub.calledOnceWith('yarn add -D missing-package', { cwd: '/workspace', stdio: 'inherit' }));
    });

    it('should install dependency using npm', () => {
      installDependency('/workspace', 'npm', 'missing-package');

      assert(execSyncStub.calledOnceWith('npm install --save-dev missing-package', { cwd: '/workspace', stdio: 'inherit' }));
    });
  });
});