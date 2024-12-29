const {
  createFileObject,
  getFileType,
} = require('../vscodeHelper/fileOperations');

/**
 * Generates the source code for a React functional component.
 *
 * @param componentName - The name of the component.
 * @param hasProps - Whether the component has props. Defaults to false.
 * @returns The source code string for the component.
 */
const createComponentSource = (componentName, hasProps = false) => {
  const componentFunctionType = hasProps
    ? `FC<${componentName}Props> = (props)`
    : `FC = ()`;
  const conditionalPropsImport = hasProps
    ? `\nimport { ${componentName}Props } from './types';\n`
    : '\n';
  const componentImportStatement = `import { FC } from 'react';${conditionalPropsImport}`;
  const createComponentDeclaration = `
const ${componentName}: ${componentFunctionType} => {
  ${hasProps ? 'const { } = props;\n' : ''}
  return <div>${componentName} Component</div>;\n};
  \nexport default ${componentName};
  `;

  return componentImportStatement + createComponentDeclaration;
};

/**
 * Generates a TypeScript interface for the component props.
 *
 * @param componentName - The name of the component.
 * @returns The TypeScript interface string for the props.
 */
const createComponentPropsDefinition = (componentName) =>
  `interface ${componentName}Props {\n\n};\n\nexport { ${componentName}Props };`;

/**
 * Generates the content for a component test file.
 *
 * @param componentName - The name of the component.
 * @returns The test file content string.
 */
const createComponentTestContent = (componentName) => {
  const componentTestImport = `import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import ${componentName} from './${componentName}';
`;
  const renderTestDeclaration = `
describe('${componentName}', () => {  
  it('renders ${componentName}', () => {
    const { getByText } = render(<${componentName} />);\n
    expect(getByText('${componentName} Component')).toBeInTheDocument();
  });
});
`;

  return componentTestImport + renderTestDeclaration;
};

/**
 * Generates files for a React component.
 *
 * @param componentName - The name of the component.
 * @param hasProps - Whether the component has props. Defaults to false.
 * @returns An object with the generated files.
 */
const generateComponentFiles = async (componentName, hasProps = false) => {
  try {
    const extension = await getFileType();
    console.log('extension: ', extension);
    

    const filesToGenerate = {
      ...createFileObject(
        componentName,
        extension[0],
        createComponentSource(componentName, hasProps)
      ),
      ...(hasProps
        ? createFileObject(
            'types',
            extension[1],
            createComponentPropsDefinition(componentName)
          )
        : {}),
      ...createFileObject(
        `${componentName}.test`,
        extension[0],
        createComponentTestContent(componentName)
      ),
    };

    return filesToGenerate;
  } catch (error) {
    console.error(error);
    return;
  }
};

module.exports = {
  createComponentPropsDefinition,
  createComponentSource,
  createComponentTestContent,
  generateComponentFiles,
};
