const sinon = require('sinon');
const assert = require('assert');
const vscode = require('vscode');
const path = require('path');
const vscodeHelpers = require('../../commands/vscodeHelper/vscodeHelpers');
const { processErrorMessage } = require('../../commands/vscodeHelper/message');
const { describe, test, beforeEach, afterEach } = require('mocha');
const dependencies = require('../../commands/vscodeHelper/dependencies');

const {
  updateContextMenu,
  processContextMenuPath,
} = vscodeHelpers;

let loadJsonPackagesStub, executeCommandStub, findFilesStub, processErrorMessageStub;
let sandbox;

describe('VSCode Helpers', () => {

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  // afterEach(() => {
  //   sandbox.restore();
  // });

  describe.only('updateContextMenu', () => {
    

    beforeEach(() => {
      loadJsonPackagesStub = sinon.stub(dependencies, 'loadJsonPackages').resolves({ dependencies: { react: '^17.0.0' } });
      executeCommandStub = sinon.stub(vscode.commands, 'executeCommand');
      findFilesStub = sinon.stub(vscode.workspace, 'findFiles').resolves([]);
      processErrorMessageStub = sinon.stub(processErrorMessage);
    });

    afterEach(() => {
      sinon.restore();
    });

    test('should set context for React project', async () => {
      await updateContextMenu();

      assert(executeCommandStub.calledWith('setContext', 'isReactProject', true));
    });

    test('should set context for non-React project', async () => {
      loadJsonPackagesStub.resolves({ dependencies: {} });

      await updateContextMenu();

      assert(executeCommandStub.calledWith('setContext', 'isReactProject', false));
    });

    test('should set context for missing Prettier configuration', async () => {
      findFilesStub.resolves([]);

      await updateContextMenu();

      assert(executeCommandStub.calledWith('setContext', 'noPrettierConfig', true));
    });

    test('should set context for existing Prettier configuration', async () => {
      findFilesStub.resolves(['.prettierrc']);

      await updateContextMenu();

      assert(executeCommandStub.calledWith('setContext', 'noPrettierConfig', false));
    });

    test('should handle errors', async () => {
      loadJsonPackagesStub.rejects(new Error('load error'));

      await updateContextMenu();

      assert(processErrorMessageStub.calledOnceWith('Update context menu load error', 'minor'));
    });
  });

  describe('processContextMenuPath', () => {
    let processErrorMessageStub;

    beforeEach(() => {
      processErrorMessageStub = sandbox.stub(processErrorMessage);
    });

    test('should return directory path for file URI', () => {
      const uri = { fsPath: 'c:/path/to/file.txt' };
      const result = processContextMenuPath(uri);

      assert.strictEqual(result, 'c:/path/to');
    });

    test('should return path for directory URI', () => {
      const uri = { fsPath: 'c:/path/to/directory' };
      const result = processContextMenuPath(uri);

      assert.strictEqual(result, 'c:/path/to/directory');
    });

    test('should handle errors', () => {
      const uri = null;
      const result = processContextMenuPath(uri);

      assert.strictEqual(result, undefined);
      assert(processErrorMessageStub.notCalled);
    });
  });
});