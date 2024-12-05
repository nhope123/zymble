const sinon = require('sinon');
const assert = require('assert');
const proxyquire = require('proxyquire');
// const vscode = require('vscode');

describe.skip('generateComponent', () => {
  let sandbox;
  let generateComponent;
  let fsMock;
  let pathMock;
  let vscodeMock;
  let helpersMock;
  let componentTemplateUtilsMock;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    fsMock = {
      existsSync: sandbox.stub(),
      rmdirSync: sandbox.stub(),
      mkdirSync: sandbox.stub(),
    };

    pathMock = {
      join: sandbox.stub().returnsArg(1),
    };

    vscodeMock = {
      window: {
        showQuickPick: sandbox.stub(),
        showErrorMessage: sandbox.stub(),
        showInformationMessage: sandbox.stub(),
      },
    };

    helpersMock = {
      createFilesWithContent: sandbox.stub(),
      getComponentName: sandbox.stub(),
      getCurrentWorkspaceFolders: sandbox.stub(),
      getTargetFolder: sandbox.stub(),
      showQuickPick: sandbox.stub(),
    };

    componentTemplateUtilsMock = {
      generateComponentFiles: sandbox.stub(),
    };

    generateComponent = proxyquire(
      '../../commands/createComponent/generateComponent',
      {
        fs: fsMock,
        path: pathMock,
        vscode: vscodeMock,
        '../vscodeHelpers': helpersMock,
        './componentTemplateUtils': componentTemplateUtilsMock,
      }
    );
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should return if no workspace folder is found', async () => {
    helpersMock.getCurrentWorkspaceFolders.returns(null);

    await generateComponent();

    assert(helpersMock.getComponentName.notCalled);
  });

  it('should return if user cancels component name input', async () => {
    helpersMock.getCurrentWorkspaceFolders.returns('workspaceFolder');
    helpersMock.getComponentName.resolves(null);

    await generateComponent();

    assert(helpersMock.getTargetFolder.notCalled);
  });

  it('should return if user cancels target folder selection', async () => {
    helpersMock.getCurrentWorkspaceFolders.returns('workspaceFolder');
    helpersMock.getComponentName.resolves('TestComponent');
    helpersMock.getTargetFolder.resolves(null);

    await generateComponent();

    assert(fsMock.existsSync.notCalled);
  });

  it('should return if component folder exists and user chooses not to overwrite', async () => {
    helpersMock.getCurrentWorkspaceFolders.returns('workspaceFolder');
    helpersMock.getComponentName.resolves('TestComponent');
    helpersMock.getTargetFolder.resolves('targetFolder');
    fsMock.existsSync.returns(true);
    vscodeMock.window.showQuickPick.resolves('No');

    await generateComponent();

    assert(fsMock.rmdirSync.notCalled);
    assert(vscodeMock.window.showErrorMessage.calledOnce);
  });

  it('should overwrite component folder if it exists and user chooses to overwrite', async () => {
    helpersMock.getCurrentWorkspaceFolders.returns('workspaceFolder');
    helpersMock.getComponentName.resolves('TestComponent');
    helpersMock.getTargetFolder.resolves('targetFolder');
    fsMock.existsSync.returns(true);
    vscodeMock.window.showQuickPick.resolves('Yes');

    await generateComponent();

    assert(fsMock.rmdirSync.calledOnce);
    assert(fsMock.mkdirSync.calledOnce);
  });

  it('should create component successfully', async () => {
    helpersMock.getCurrentWorkspaceFolders.returns('workspaceFolder');
    helpersMock.getComponentName.resolves('TestComponent');
    helpersMock.getTargetFolder.resolves('targetFolder');
    fsMock.existsSync.returns(false);
    componentTemplateUtilsMock.generateComponentFiles.returns([
      'file1',
      'file2',
    ]);

    await generateComponent();

    assert(fsMock.mkdirSync.calledOnce);
    assert(helpersMock.createFilesWithContent.calledOnce);
    assert(vscodeMock.window.showInformationMessage.calledOnce);
  });

  it('should handle errors during folder creation', async () => {
    helpersMock.getCurrentWorkspaceFolders.returns('workspaceFolder');
    helpersMock.getComponentName.resolves('TestComponent');
    helpersMock.getTargetFolder.resolves('targetFolder');
    fsMock.existsSync.returns(false);
    fsMock.mkdirSync.throws(new Error('Error creating folder'));

    try {
      await generateComponent();
    } catch (error) {
      assert.strictEqual(error.message, 'Error creating folder');
    }

    assert(vscodeMock.window.showErrorMessage.calledOnce);
  });

  it('should handle errors during file creation', async () => {
    helpersMock.getCurrentWorkspaceFolders.returns('workspaceFolder');
    helpersMock.getComponentName.resolves('TestComponent');
    helpersMock.getTargetFolder.resolves('targetFolder');
    fsMock.existsSync.returns(false);
    componentTemplateUtilsMock.generateComponentFiles.returns([
      'file1',
      'file2',
    ]);
    helpersMock.createFilesWithContent.throws(
      new Error('Error creating files')
    );

    try {
      await generateComponent();
    } catch (error) {
      assert.strictEqual(error.message, 'Error creating files');
    }

    assert(vscodeMock.window.showErrorMessage.calledOnce);
  });
});
