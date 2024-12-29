const assert = require('assert');
const {
  createComponentPropsDefinition,
  createComponentSource,
  createComponentTestContent,
  generateComponentFiles,
} = require('../../commands/createComponent/componentTemplateUtils');
const { describe, test, beforeEach, afterEach } = require('mocha');
const sinon = require('sinon');
const fileOps = require('../../commands/vscodeHelper/fileOperations');

describe('Component Template Utils', () => {
  describe('Create Component Props Definition', () => {
    test('should generate correct TypeScript interface for given component name', () => {
      const componentName = 'TestComponent';
      const expectedOutput = `interface TestComponentProps {\n\n};\n\nexport { TestComponentProps };`;
      const result = createComponentPropsDefinition(componentName);
      assert.deepEqual(result, expectedOutput);
    });

    test('should handle empty component name', () => {
      const componentName = '';
      const expectedOutput = `interface Props {\n\n};\n\nexport { Props };`;
      const result = createComponentPropsDefinition(componentName);
      if (result !== expectedOutput) {
        throw new Error(`Expected "${expectedOutput}" but got "${result}"`);
      }
    });
  });
  describe('Create Component Source', () => {
    test('should generate correct component source without props', () => {
      const componentName = 'TestComponent';
      const expectedOutput = `import { FC } from 'react';\n\nconst TestComponent: FC = () => {\n  \n  return <div>TestComponent Component</div>;\n};\n  \nexport default TestComponent;\n  `;
      const result = createComponentSource(componentName);
      assert.deepEqual(result, expectedOutput);
    });

    test('should generate correct component source with props', () => {
      const componentName = 'TestComponent';
      const expectedOutput = `import { FC } from 'react';\nimport { TestComponentProps } from './types';\n\nconst TestComponent: FC<TestComponentProps> = (props) => {\n  const { } = props;\n\n  return <div>TestComponent Component</div>;\n};\n  \nexport default TestComponent;\n  `;
      const result = createComponentSource(componentName, true);
      assert.deepEqual(result, expectedOutput);
    });

    test('should handle empty component name without props', () => {
      const componentName = '';
      const expectedOutput = `import { FC } from 'react';\n\nconst : FC = () => {\n  \n  return <div> Component</div>;\n};\n  \nexport default ;\n  `;
      const result = createComponentSource(componentName);
      assert.deepEqual(result, expectedOutput);
    });

    test('should handle empty component name with props', () => {
      const componentName = '';
      const expectedOutput = `import { FC } from 'react';\nimport { Props } from './types';\n\nconst : FC<Props> = (props) => {\n  const { } = props;\n\n  return <div> Component</div>;\n};\n  \nexport default ;\n  `;
      const result = createComponentSource(componentName, true);
      assert.deepEqual(result, expectedOutput);
    });
  });
  describe('Create Component Test Content', () => {
    test('should generate correct test content for given component name', () => {
      const componentName = 'TestComponent';
      const expectedOutput = `import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import TestComponent from './TestComponent';

describe('TestComponent', () => {  
  it('renders TestComponent', () => {
    const { getByText } = render(<TestComponent />);

    expect(getByText('TestComponent Component')).toBeInTheDocument();
  });
});
`;
      const result = createComponentTestContent(componentName);
      assert.deepEqual(result, expectedOutput);
    });

    test('should handle empty component name', () => {
      const componentName = '';
      const expectedOutput = `import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import  from './';

describe('', () => {  
  it('renders ', () => {
    const { getByText } = render(< />);

    expect(getByText(' Component')).toBeInTheDocument();
  });
});
`;
      const result = createComponentTestContent(componentName);
      assert.deepEqual(result, expectedOutput);
    });
  });
  describe('Generate Component Files', () => {
    let getFileTypeStub;

    beforeEach(() => {
      getFileTypeStub = sinon
        .stub(fileOps, 'getFileType')
        .callsFake(() => ['.tsx', '.ts']);
    });

    afterEach(() => {
      sinon.restore();
    });

    test('should generate correct files without props', async () => {
      const componentName = 'FakeComponent';
      const expectedOutput = {
        'FakeComponent.jsx': `import { FC } from 'react';\n\nconst FakeComponent: FC = () => {\n  \n  return <div>FakeComponent Component</div>;\n};\n  \nexport default FakeComponent;\n  `,
        'FakeComponent.test.jsx': `import { render } from '@testing-library/react';\nimport { describe, expect, it } from 'vitest';\nimport FakeComponent from './FakeComponent';\n\ndescribe('FakeComponent', () => {  \n  it('renders FakeComponent', () => {\n    const { getByText } = render(<FakeComponent />);\n\n    expect(getByText('FakeComponent Component')).toBeInTheDocument();\n  });\n});\n`,
      };

      const result = await generateComponentFiles(componentName);
      assert.deepEqual(result, expectedOutput);
    });

    test('should generate correct files with props', async () => {
      const componentName = 'TestComponent';
      const expectedOutput = {
        'TestComponent.jsx': `import { FC } from 'react';\nimport { TestComponentProps } from './types';\n\nconst TestComponent: FC<TestComponentProps> = (props) => {\n  const { } = props;\n\n  return <div>TestComponent Component</div>;\n};\n  \nexport default TestComponent;\n  `,
        'TestComponent.test.jsx': `import { render } from '@testing-library/react';\nimport { describe, expect, it } from 'vitest';\nimport TestComponent from './TestComponent';\n\ndescribe('TestComponent', () => {  \n  it('renders TestComponent', () => {\n    const { getByText } = render(<TestComponent />);\n\n    expect(getByText('TestComponent Component')).toBeInTheDocument();\n  });\n});\n`,
        'types.js': `interface TestComponentProps {\n\n};\n\nexport { TestComponentProps };`,
      };

      const result = await generateComponentFiles(componentName, true);
      assert.deepEqual(result, expectedOutput);
    });

    test('should handle errors gracefully', async () => {
      getFileTypeStub.rejects(new Error('Test error'));

      const result = await generateComponentFiles('TestComponent');
      const expectedOutput = {
        'TestComponent.jsx': `import { FC } from 'react';\n\nconst TestComponent: FC = () => {\n  \n  return <div>TestComponent Component</div>;\n};\n  \nexport default TestComponent;\n  `,
        'TestComponent.test.jsx': `import { render } from '@testing-library/react';\nimport { describe, expect, it } from 'vitest';\nimport TestComponent from './TestComponent';\n\ndescribe('TestComponent', () => {  \n  it('renders TestComponent', () => {\n    const { getByText } = render(<TestComponent />);\n\n    expect(getByText('TestComponent Component')).toBeInTheDocument();\n  });\n});\n`,
      };
      assert.deepEqual(result, expectedOutput);
    });
  });
});
