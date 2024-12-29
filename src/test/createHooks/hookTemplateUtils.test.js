const sinon = require('sinon');
const assert = require('assert');
const {
  createHookSource,
  createHookTestContent,
  createHookTypeDefinition,
  generateHookFiles,
} = require('../../commands/createHooks/hookTemplateUtils');
const { processErrorMessage } = require('../../commands/vscodeHelper/message');
const { createFileObject, getFileType } = require('../../commands/vscodeHelper/fileOperations');
const { describe, it, beforeEach, afterEach } = require('mocha');

describe('Hook Template Utils', () => {
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('createHookSource', () => {
    it('should create hook source with state and effect', () => {
      const result = createHookSource('useCustomHook', true, true);
      const expected = `import { useState, useEffect } from 'react';\nimport { UseCustomHookReturnType } from './types';

const useCustomHook = (): UseCustomHookReturnType  => {
  const [state, setState] = useState<>(null);
  useEffect(() => {
    // effect logic
  }, []);  
  
  return {};
};

export default useCustomHook;
`;
      assert.strictEqual(result, expected);
    });

    it('should create hook source with state only', () => {
      const result = createHookSource('useCustomHook', true, false);
      const expected = `import { useState } from 'react';\nimport { UseCustomHookReturnType } from './types';

const useCustomHook = (): UseCustomHookReturnType  => {
  const [state, setState] = useState<>(null);
  
  return {};
};

export default useCustomHook;
`;
      assert.strictEqual(result, expected);
    });

    it('should create hook source with effect only', () => {
      const result = createHookSource('useCustomHook', false, true);
      const expected = `import { useEffect } from 'react';\nimport { UseCustomHookReturnType } from './types';

const useCustomHook = (): UseCustomHookReturnType  => {
  
  useEffect(() => {
    // effect logic
  }, []);  
  
  return {};
};

export default useCustomHook;
`;
      assert.strictEqual(result, expected);
    });

    it('should create hook source without state and effect', () => {
      const result = createHookSource('useCustomHook', false, false);
      const expected = `import { UseCustomHookReturnType } from './types';

const useCustomHook = (): UseCustomHookReturnType  => {
  
  return {};
};

export default useCustomHook;
`;
      assert.strictEqual(result, expected);
    });
  });

  describe('createHookTestContent', () => {
    it('should create hook test content', () => {
      const result = createHookTestContent('useCustomHook');
      const expected = `import { renderHook } from '@testing-library/react-hooks';
import { describe, expect, it } from 'vitest';
import useCustomHook from './useCustomHook';

describe('useCustomHook', () => {
  it('should be defined', () => {
    const { result } = renderHook(() => useCustomHook());
    expect(result.current).toBeDefined();
  });
});
`;
      assert.strictEqual(result, expected);
    });
  });

  describe('createHookTypeDefinition', () => {
    it('should create hook type definition', () => {
      const result = createHookTypeDefinition('useCustomHook');
      const expected = `export type UseCustomHookReturnType = {
  // define return type here
};
`;
      assert.strictEqual(result, expected);
    });
  });

  describe('generateHookFiles', () => {
    let getFileTypeStub, createFileObjectStub, processErrorMessageStub;

    beforeEach(() => {
      getFileTypeStub = sandbox.stub(getFileType);
      createFileObjectStub = sandbox.stub(createFileObject);
      processErrorMessageStub = sandbox.stub(processErrorMessage);
    });

    it('should generate hook files with state and effect', async () => {
      getFileTypeStub.resolves(['jsx', 'js']);
      createFileObjectStub.onFirstCall().returns({ 'useCustomHook.js': 'hook source content' });
      createFileObjectStub.onSecondCall().returns({ 'useCustomHook.test.js': 'test content' });
      createFileObjectStub.onThirdCall().returns({ 'types.js': 'type definition content' });

      const result = await generateHookFiles('useCustomHook', true, true);

      assert.deepStrictEqual(result, {
        'useCustomHook.js': 'hook source content',
        'useCustomHook.test.js': 'test content',
        'types.js': 'type definition content',
      });
    });

    it('should handle errors', async () => {
      getFileTypeStub.rejects(new Error('file type error'));

      await generateHookFiles('useCustomHook', true, true);

      assert(processErrorMessageStub.calledOnceWith('file type error', 'minor'));
    });
  });
});