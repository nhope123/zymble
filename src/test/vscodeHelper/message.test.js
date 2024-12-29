const sinon = require('sinon');
const assert = require('assert');
const vscode = require('vscode');
const {
  processErrorMessage,
  showInformationMessage,
  showInputBox,
  showQuickPick,
} = require('../../commands/vscodeHelper/message');
const { describe, it, beforeEach, afterEach } = require('mocha');

describe('Message helper', () => {
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('processErrorMessage', () => {
    let consoleErrorStub;

    beforeEach(() => {
      consoleErrorStub = sandbox.stub(console, 'error');
    });

    it('should log minor error messages', () => {
      processErrorMessage('Minor error', 'minor');
      assert(consoleErrorStub.calledOnceWith('Minor error'));
    });

    it('should throw sever error messages', () => {
      assert.throws(() => processErrorMessage('Sever error'), new Error('Sever error'));
      assert(consoleErrorStub.calledOnceWith('Sever error'));
    });
  });

  describe('showInformationMessage', () => {
    let showInformationMessageStub;

    beforeEach(() => {
      showInformationMessageStub = sandbox.stub(vscode.window, 'showInformationMessage');
    });

    it('should show information message', () => {
      showInformationMessage('Info message');
      assert(showInformationMessageStub.calledOnceWith('Info message'));
    });
  });

  describe('showInputBox', () => {
    let showInputBoxStub;

    beforeEach(() => {
      showInputBoxStub = sandbox.stub(vscode.window, 'showInputBox');
    });

    it('should show input box with options', async () => {
      const options = { prompt: 'Enter value' };
      showInputBoxStub.resolves('User input');

      const result = await showInputBox(options);

      assert(showInputBoxStub.calledOnceWith(sinon.match(options)));
      assert.strictEqual(result, 'User input');
    });

    it('should validate input', async () => {
      const options = { prompt: 'Enter value' };
      showInputBoxStub.callsFake(async (opts) => {
        return opts.validateInput('') || 'User input';
      });

      const result = await showInputBox(options);

      assert(showInputBoxStub.calledOnceWith(sinon.match(options)));
      assert.strictEqual(result, 'Input cannot be empty');
    });
  });

  describe('showQuickPick', () => {
    let showQuickPickStub;

    beforeEach(() => {
      showQuickPickStub = sandbox.stub(vscode.window, 'showQuickPick');
    });

    it('should show quick pick with items and options', async () => {
      const items = ['Option 1', 'Option 2'];
      const options = { placeHolder: 'Select an option' };
      showQuickPickStub.resolves('Option 1');

      const result = await showQuickPick(items, options);

      assert(showQuickPickStub.calledOnceWith(items, options));
      assert.strictEqual(result, 'Option 1');
    });
  });
});