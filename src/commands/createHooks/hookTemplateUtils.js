const { processErrorMessage } = require('../vscodeHelper/message');

const {
  createFileObject,
  getFileType,
} = require('../vscodeHelper/fileOperations.js');
const { capitalize } = require('../vscodeHelper/vscodeHelpers.js');
const vscode = require('vscode');

const createHookSource = (hookName, hasState, hasEffect) => {
  const stateImport =
    hasState || hasEffect
      ? `import { ${hasState ? 'useState,' : ''} ${hasEffect ? 'useEffect' : ''} } from 'react';\n`
      : '';
  const stateDeclaration = hasState
    ? `const [state, setState] = useState<>(null);\n`
    : '';
  const effectDeclaration = hasEffect
    ? `useEffect(() => {\n    // effect logic\n  }, []);\n`
    : '';

  return `${stateImport}import { ${capitalize(hookName)}ReturnType } from './types';

const ${hookName} = (): ${capitalize(hookName)}ReturnType  => {
  ${stateDeclaration}
  ${effectDeclaration}  
  return {};
};

export default ${hookName};
`;
};

const createHookTestContent = (hookName) => {
  return `import { renderHook } from '@testing-library/react-hooks';
import { describe, expect, it } from 'vitest';
import ${hookName} from './${hookName}';

describe('${hookName}', () => {
  it('should be defined', () => {
    const { result } = renderHook(() => ${hookName}());
    expect(result.current).toBeDefined();
  });
});
`;
};

const createHookTypeDefinition = (hookName) => {
  return `export type ${capitalize(hookName)}ReturnType = {
  // define return type here
};
`;
};

const generateHookFiles = async (
  hookName,
  hasState = false,
  hasEffect = false
) => {
  try {
    const extension = await getFileType();

    const filesToGenerate = {
      ...createFileObject(
        hookName,
        extension[1],
        createHookSource(hookName, hasState, hasEffect)
      ),
      ...createFileObject(
        `${hookName}.test`,
        extension[1],
        createHookTestContent(hookName)
      ),
      ...createFileObject(
        'types',
        extension[1],
        createHookTypeDefinition(hookName)
      ),
    };

    return filesToGenerate;
  } catch (error) {
    processErrorMessage(`Generate hook files error: ${error.message}`);
  }
};

module.exports = generateHookFiles;
