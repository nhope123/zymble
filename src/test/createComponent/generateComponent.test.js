const vscode = require('vscode');
const path = require('path');
const generateComponent = require('../../commands/createComponent/generateComponent');
const compTemplate = require('../../commands/createComponent/componentTemplateUtils');
const { describe, test, beforeEach, afterEach } = require('mocha');
const sinon = require('sinon');
const assert = require('assert');
const message = require('../../commands/vscodeHelper/message');
const vsHelper = require('../../commands/vscodeHelper/vscodeHelpers');
const fileOperation = require('../../commands/vscodeHelper/fileOperations');
const compTempUtil = require('../../commands/createComponent/componentTemplateUtils');

describe('generateComponent', () => {
  let fetchWorkspaceFoldersStub;
  let getComponentNameStub;
  let processContextMenuPathStub;
  let showQuickPickStub;
  let getTargetFolderStub;
  let createDirectoryStub;
  let generateComponentFilesStub;
  let createFilesWithContentStub;
  let showInformationMessageStub;
  let processErrorMessageStub;

  // const getComponentNameStub = sinon.stub(vsHelper, 'getComponentName');
  // const fetchWorkspaceFoldersStub = sinon.stub(
  //   vsHelper,
  //   'fetchWorkspaceFolders'
  // );
  // const processContextMenuPathStub = sinon.stub(
  //   vsHelper,
  //   'processContextMenuPath'
  // );
  // const showQuickPickStub = sinon.stub(message, 'showQuickPick');
  // const getTargetFolderStub = sinon.stub(fileOperation, 'getTargetFolder');

  // // const  processErrorMessageStub = sinon.stub(message, 'processErrorMessage');
  // const createDirectoryStub = sinon.stub(fileOperation, 'createDirectory');
  // const generateComponentFilesStub = sinon.stub(
  //   compTemplate,
  //   'generateComponentFiles'
  // );

  // const createFilesWithContentStub = sinon.stub(
  //   fileOperation,
  //   'createFilesWithContent'
  // );

  // const showInformationMessageStub = sinon.stub(
  //   message,
  //   'showInformationMessage'
  // );

  beforeEach(() => {
    getComponentNameStub = sinon
      .stub(vsHelper, 'getComponentName');
      // .callsFake(() => 'FakeComponent');
    processContextMenuPathStub = sinon.stub(vsHelper, 'processContextMenuPath');

    createDirectoryStub = sinon.stub(fileOperation, 'createDirectory');
    createFilesWithContentStub = sinon.stub(
      fileOperation,
      'createFilesWithContent'
    );
    fetchWorkspaceFoldersStub = sinon
      .stub(fileOperation, 'fetchWorkspaceFolders')
      .callsFake(() => [{ uri: { fsPath: '/workspace/path' } }]);
    getTargetFolderStub = sinon.stub(fileOperation, 'getTargetFolder');

    generateComponentFilesStub = sinon.stub(
      compTempUtil,
      'generateComponentFiles'
    );

    showInformationMessageStub = sinon.stub(message, 'showInformationMessage');
    showQuickPickStub = sinon.stub(message, 'showQuickPick');
    processErrorMessageStub = sinon.stub(message, 'processErrorMessage');

    // getComponentNameStub.resolves('TestComponent');
    // fetchWorkspaceFoldersStub.resolves([{ uri: { fsPath: 'path' } }]);
    // processContextMenuPathStub.returns('/path');
    // getTargetFolderStub.resolves('/path/to/target');
    // showQuickPickStub.resolves('yes');
    // // processErrorMessageStub.throws('')

    // createDirectoryStub.resolves();
    // // createFilesWithContentStub = sinon.stub();
    // generateComponentFilesStub.resolves();
    // showInformationMessageStub = sinon.stub();

    // sandbox = sinon.createSandbox();
    // sandbox.stub(vscode.window, 'showErrorMessage');
  });

  afterEach(() => {
    sinon.restore();
  });

  test('should create a component successfully', async () => {
    await getComponentNameStub.callsFake(() => 'FakeComponent');
    await generateComponent().then((done) => {

      assert.ok(fetchWorkspaceFoldersStub.calledOnce);
    assert.ok(getComponentNameStub.calledOnce);
    assert.ok(showQuickPickStub.calledOnce);
    assert.ok(getTargetFolderStub.calledOnce);
    assert.ok(createDirectoryStub.calledOnce);
    assert.ok(generateComponentFilesStub.calledOnce);
    assert.ok(createFilesWithContentStub.calledOnce);
    assert.ok(showInformationMessageStub.calledOnce);
    done();
    });

    
  });

  // test('should handle errors gracefully', async () => {
  //   const errorMessage = 'Test error';
  //   getComponentNameStub = sinon.stub().rejects(new Error(errorMessage));

  //   await generateComponent();

  //   assert.ok(processErrorMessage.calledOnce);
  //   assert.ok(vscode.window.showErrorMessage.calledOnce);
  // });
});
