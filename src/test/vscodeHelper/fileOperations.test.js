const { describe, test, beforeEach, afterEach } = require('mocha');
const sinon = require('sinon');

const { createFileObject, fetchWorkspaceFolders } = require('../../commands/vscodeHelper/fileOperations');
const assert = require('assert');
const vscode = require('vscode');

describe('File Operations helper', () => {
  describe('Create File Object', () => {
    // let consoleStub;
    beforeEach(() => {
      // Stub console.log
      // consoleStub = sinon.stub(console, 'log');
    });

    afterEach(() => {
      // Restore console.log
      // consoleStub.restore();
    });

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

  // describe('Get Current Workspace Folders', () => {
  //   // beforeEach(() => {
  //   //   originalWorkspaceFolders = vscode.workspace.workspaceFolders;
  //   // });

  //   // afterEach(() => {
  //   //   vscode.workspace.workspaceFolders = originalWorkspaceFolders;
  //   // });

  //   test('Should return an array of workspace folders', () => {
  //     const originalWorkspaceFolders = vscode.workspace.workspaceFolders;

  //     // Mocking workspace folders
  //     vscode.workspace.workspaceFolders = [
  //       {
  //         uri: {
  //           fsPath: '/path/to/workspace',
  //         },
  //         name: 'workspace',
  //         index: 0,
  //       },
  //     ];

  //     const workspaceFolders = fetchWorkspaceFolders();
  //     assert.ok(
  //       Array.isArray(workspaceFolders),
  //       'Expected an array of workspace folders'
  //     );

  //     // Restore the original workspace folders
  //     vscode.workspace.workspaceFolders = originalWorkspaceFolders;
  //   });

  //   test('Should return an empty array if no workspace folders are open', () => {
  //     const originalWorkspaceFolders = vscode.workspace.workspaceFolders;

  //     // Mocking no workspace folders
  //     vscode.workspace.workspaceFolders = undefined;

  //     const workspaceFolders = fetchWorkspaceFolders();
  //     assert.strictEqual(
  //       workspaceFolders.length,
  //       0,
  //       'Expected an empty array when no workspace folders are open'
  //     );

  //     // Restore the original workspace folders
  //     vscode.workspace.workspaceFolders = originalWorkspaceFolders;
  //   });
  // });
});
