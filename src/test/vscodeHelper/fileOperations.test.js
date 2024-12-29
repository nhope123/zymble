const { describe, test, beforeEach, afterEach } = require('mocha');
const sinon = require('sinon');
const fs = require('fs').promises;
const vscode = require('vscode');
const message = require('../../commands/vscodeHelper/message')

const {
  createFileObject,
  fetchWorkspaceFolders,
  getFileType,
  createDirectory,
} = require('../../commands/vscodeHelper/fileOperations');
const assert = require('assert');

let findFilesStub;
let readFileStub;
let sandbox;

describe('File Operations helper', () => {
  describe('Create File Object', () => {
   
    test('Should throw error for missing name', () => {
      // const originalConsoleError = console.error;
      // console.error = () => {}; // Silence console.error
      // consoleStub.returns('');
      assert.throws(
        () => createFileObject(null, 'tsx', 'content'),
        new Error('Create File Object Error: Missing file name or extension.')
      );

      // console.error = originalConsoleError; // Restore console.error
    });

    test('Should throw error for missing extension', () => {
      assert.throws(
        () => createFileObject('file', null, 'content'),
        new Error('Create File Object Error: Missing file name or extension.')
      );
    });

    test('Should not throw error for missing content', () => {
      assert.doesNotThrow(() => createFileObject('file', 'txt', null));
    });

    test('Should return correct result', () => {
      const result = createFileObject('file', 'txt', null);
      assert.deepStrictEqual(result, {
        'file.txt': null,
      });
    });

    test('Should return correct result with content', () => {
      const result = createFileObject('file', 'txt', 'sample content');
      assert.deepStrictEqual(result, {
        'file.txt': 'sample content',
      });
    });

    test('Should handle different file extensions', () => {
      const result = createFileObject(
        'file',
        'js',
        'console.log("Hello, world!");'
      );
      assert.deepStrictEqual(result, {
        'file.js': 'console.log("Hello, world!");',
      });
    });

    test('Should handle non-string name', () => {
      assert.deepStrictEqual(createFileObject(123, 'txt', 'content'), {
        '123.txt': 'content',
      });
    });

    test('Should handle non-string extension', () => {
      assert.deepStrictEqual(createFileObject('file', 123, 'content'), {
        'file.123': 'content',
      });
    });

    test('Should handle non-string content', () => {
      assert.deepStrictEqual(createFileObject('file', 'txt', 123), {
        'file.txt': 123,
      });
    });

    test('Should handle object content', () => {
      const content = {
        name: 'jack',
      };
      assert.deepStrictEqual(createFileObject('file', 'txt', content), {
        'file.txt': content,
      });
    });
  });

  describe('createDirectory', () => {
    let accessStub, rmdirStub, mkdirStub, showQuickPickStub, processErrorMessageStub;

    beforeEach(() => {
      sandbox = sinon.createSandbox();
      accessStub = sandbox.stub(fs, 'access');
      rmdirStub = sandbox.stub(fs, 'rmdir');
      mkdirStub = sandbox.stub(fs, 'mkdir');
      showQuickPickStub = sinon.stub(message, 'showQuickPick');
      processErrorMessageStub = sandbox.stub(message, 'processErrorMessage');
    });

    afterEach(() => {
      sandbox.restore();
    });

    test('should create a new directory if it does not exist', async () => {
      accessStub.rejects();
      mkdirStub.resolves();

      await createDirectory('/path/to/dir', 'dir');

      assert(mkdirStub.calledOnceWith('/path/to/dir', { recursive: true }));
    });

    test('should prompt for overwrite if directory exists', async () => {
      accessStub.resolves();
      showQuickPickStub.resolves('yes');
      rmdirStub.resolves();
      mkdirStub.resolves();

      await createDirectory('/path/to/dir', 'dir');

      assert(showQuickPickStub.calledOnce);
      assert(rmdirStub.calledOnceWith('/path/to/dir', { recursive: true }));
      assert(mkdirStub.calledOnceWith('/path/to/dir', { recursive: true }));
      done();
    });

    test('should not overwrite if user cancels', async () => {
      accessStub.resolves();
      showQuickPickStub.resolves('no');

      await createDirectory('/path/to/dir', 'dir');

      assert(showQuickPickStub.calledOnce);
      assert(rmdirStub.notCalled);
      assert(mkdirStub.notCalled);
      assert(processErrorMessageStub.calledOnceWith('Cancel folder override'));
    });

    test('should handle errors', async () => {
      accessStub.rejects(new Error('access error'));
      processErrorMessageStub.resetHistory();

      await createDirectory('/path/to/dir', 'dir');

      assert(processErrorMessageStub.calledOnceWith('access error'));
    });
  });

  describe('Get File Type', () => {
    beforeEach(() => {
      findFilesStub = sinon.stub(vscode.workspace, 'findFiles');
      readFileStub = sinon.stub(fs, 'readFile');
    });

    afterEach(() => {
      sinon.restore();
    });

    test('Should return TypeScript file types if TypeScript files are found', async () => {
      findFilesStub.onFirstCall().resolves([{ fsPath: 'file.ts' }]);
      findFilesStub.onSecondCall().resolves([]);

      const result = await getFileType();
      assert.deepStrictEqual(result, ['tsx', 'ts']);
    });

    test('Should return TypeScript file types if TypeScript is in devDependencies', async () => {
      findFilesStub.onFirstCall().resolves([]);
      findFilesStub.onSecondCall().resolves([{ fsPath: 'package.json' }]);
      readFileStub.resolves(
        JSON.stringify({ devDependencies: { typescript: '^4.0.0' } })
      );

      const result = await getFileType();
      assert.deepStrictEqual(result, ['tsx', 'ts']);
    });

    test('Should return JavaScript file types if no TypeScript files or devDependencies are found', async () => {
      findFilesStub.onFirstCall().resolves([]);
      findFilesStub.onSecondCall().resolves([]);

      const result = await getFileType();
      assert.deepStrictEqual(result, ['jsx', 'js']);
    });

    test('Should handle errors and return undefined', async () => {
      findFilesStub.rejects(new Error('Failed to find files'));

      const result = await getFileType();
      assert.strictEqual(result, undefined);

      findFilesStub.restore();
      findFilesStub.onFirstCall().resolves([]);
      findFilesStub.onSecondCall().resolves([{ fsPath: 'package.json' }]);
      readFileStub.rejects(new Error('Fail file read!'));

      const result2 = await getFileType();
      assert.strictEqual(result2, undefined);
    });
  });

  describe('Get Current Workspace Folders', () => {
    beforeEach(() => {
      sandbox = sinon.createSandbox();
    });

    afterEach(() => {
      sandbox.restore();
    });

    test('should return workspace folders when they exist', () => {
      const mockWorkspaceFolders = [
        { uri: vscode.Uri.file('/path/to/folder1'), name: 'folder1', index: 0 },
        { uri: vscode.Uri.file('/path/to/folder2'), name: 'folder2', index: 1 }
      ];
      sandbox.stub(vscode.workspace, 'workspaceFolders').value(mockWorkspaceFolders);
  
  
      const result = fetchWorkspaceFolders();
  
  
      assert.strictEqual(result, mockWorkspaceFolders);
    });

    test('should call processErrorMessage and return undefined when no workspace folders', () => {
      sandbox.stub(vscode.workspace, 'workspaceFolders').value(undefined);
            
      assert.throws(fetchWorkspaceFolders, new Error('Please open a folder first.'));      
    });
  
  
    test('should handle empty array of workspace folders', () => {
      sandbox.stub(vscode.workspace, 'workspaceFolders').value([]);
  
  
      const result = fetchWorkspaceFolders();
  
  
      assert.deepStrictEqual(result, []);
    });
  
  
    test('should not call processErrorMessage when workspace folders exist', () => {
      const mockWorkspaceFolders = [
        { uri: vscode.Uri.file('/path/to/folder'), name: 'folder', index: 0 }
      ];
      sandbox.stub(vscode.workspace, 'workspaceFolders').value(mockWorkspaceFolders);
      const processErrorMessageStub = sandbox.stub(message, 'processErrorMessage');
  
  
      fetchWorkspaceFolders();
  
  
      assert(processErrorMessageStub.notCalled);
    });

    
  });
});
