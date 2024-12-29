const sinon = require('sinon');
const assert = require('assert');
const vscode = require('vscode');
const path = require('path');
const generateHook = require('../../commands/createHooks/generateHook');
const {
  processErrorMessage,
  showQuickPick,
  showInformationMessage,
} = require('../../commands/vscodeHelper/message');
const {
  createDirectory,
  createFilesWithContent,
  findDirectory,
  getTargetFolder,
  processContextMenuPath,
  generateHookFiles,
} = require('../../commands/vscodeHelper/fileOperations');
const { describe, it, beforeEach, afterEach } = require('mocha');

describe('Generate Hook', () => {
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('generateHook', () => {
    let showQuickPickStub, processErrorMessageStub, showInformationMessageStub;
    let createDirectoryStub, createFilesWithContentStub, findDirectoryStub, getTargetFolderStub, processContextMenuPathStub, generateHookFilesStub;

    beforeEach(() => {
      showQuickPickStub = sandbox.stub(showQuickPick);
      processErrorMessageStub = sandbox.stub(processErrorMessage);
      showInformationMessageStub = sandbox.stub(showInformationMessage);
      createDirectoryStub = sandbox.stub(createDirectory);
      createFilesWithContentStub = sandbox.stub(createFilesWithContent);
      findDirectoryStub = sandbox.stub(findDirectory);
      getTargetFolderStub = sandbox.stub(getTargetFolder);
      processContextMenuPathStub = sandbox.stub(processContextMenuPath);
      generateHookFilesStub = sandbox.stub(generateHookFiles);
    });

    it('should cancel operation if hook name is not provided', async () => {
      await generateHook();

      assert(processErrorMessageStub.calledOnceWith('Operation cancelled: Unsatisfied hook name.'));
    });

    it('should format hook name correctly', async () => {
      const hookName = 'useCustomHook';
      const uri = { fsPath: 'c:/path/to/file.js' };

      showQuickPickStub.onFirstCall().resolves('yes');
      showQuickPickStub.onSecondCall().resolves('no');
      processContextMenuPathStub.returns('c:/path/to');
      findDirectoryStub.resolves('c:/path/to/hooks');
      generateHookFilesStub.resolves({ 'index.js': 'content' });

      await generateHook(hookName, uri);

      assert.strictEqual(hookName, 'useCustomHook');
    });

    it('should create directory and files for the hook', async () => {
      const hookName = 'useCustomHook';
      const uri = { fsPath: 'c:/path/to/file.js' };

      showQuickPickStub.onFirstCall().resolves('yes');
      showQuickPickStub.onSecondCall().resolves('no');
      processContextMenuPathStub.returns('c:/path/to');
      findDirectoryStub.resolves('c:/path/to/hooks');
      generateHookFilesStub.resolves({ 'index.js': 'content' });

      await generateHook(hookName, uri);

      assert(createDirectoryStub.calledOnceWith('c:/path/to/hooks/useCustomHook', 'useCustomHook'));
      assert(createFilesWithContentStub.calledOnceWith('c:/path/to/hooks/useCustomHook', { 'index.js': 'content' }));
      assert(showInformationMessageStub.calledOnceWith('Custom hook useCustomHook created successfully!'));
    });

    it('should handle errors', async () => {
      const hookName = 'useCustomHook';
      const uri = { fsPath: 'c:/path/to/file.js' };

      showQuickPickStub.onFirstCall().resolves('yes');
      showQuickPickStub.onSecondCall().resolves('no');
      processContextMenuPathStub.returns('c:/path/to');
      findDirectoryStub.rejects(new Error('find directory error'));

      await generateHook(hookName, uri);

      assert(processErrorMessageStub.calledOnceWith('find directory error', 'minor'));
      assert(vscode.window.showErrorMessage.calledOnceWith('find directory error'));
    });
  });
});