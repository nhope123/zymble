const assert = require('assert');
const {
  createComponentPropsDefinition,
  // createComponentSource,
  // createComponentTestContent,
  // generateComponentFiles,
} = require('./componentTemplateUtils');
const { suite, test } = require('mocha');

suite('Component Template Utils', () => {
  suite('Create Component Props Definition', () => {
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
});
