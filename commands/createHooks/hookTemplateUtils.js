const { capitalize, createFileObject } = require("../generatorHelpers.js");
const { getFileType } = require('../vscodeHelpers.js');

const createHookSource = (hookName, hasState, hasEffect) => {
  const stateImport = hasState || hasEffect ? `import { ${hasState ? 'useState,' : ''} ${hasEffect ? 'useEffect' : ''} } from 'react';\n` : '';
  const stateDeclaration = hasState ? `const [state, setState] = useState<>(null);\n` : '';
  const effectDeclaration = hasEffect ? `useEffect(() => {\n    // effect logic\n  }, []);\n` : '';

  return (
`${stateImport}import { ${capitalize(hookName)}ReturnType } from './types';

const ${hookName} = (): ${capitalize(hookName)}ReturnType  => {
  ${stateDeclaration}
  ${effectDeclaration}  
  return {};
};

export default ${hookName};
`);
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

const generateHookFiles = async (hookName, hasState = false, hasEffect = false) => {
  const extension = await getFileType()[1];
  const filesToGenerate = {
    ...createFileObject(
      hookName,
      extension,
      createHookSource(hookName, hasState, hasEffect)
    ),
    ...createFileObject(
      `${hookName}.test`,
      extension,
      createHookTestContent(hookName)
    ),
    ...createFileObject(
      'types',
      extension,
      createHookTypeDefinition(hookName)
    ),
  };

  return filesToGenerate;
};

module.exports = generateHookFiles;