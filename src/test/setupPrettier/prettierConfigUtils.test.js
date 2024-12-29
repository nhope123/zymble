const sinon = require('sinon');
const assert = require('assert');
const {
  getCommonJsConfig,
  getModuleConfig,
} = require('../../commands/setupPrettier/prettierConfigUtils');
const { describe, it, beforeEach, afterEach } = require('mocha');

describe('Prettier Config Utils', () => {
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('getCommonJsConfig', () => {
    it('should generate CommonJS config correctly', () => {
      const configs = {
        trailingComma: 'es5',
        printWidth: 80,
        tabWidth: 2,
        semi: true,
        singleQuote: true,
        arrowParens: 'always',
      };
      const result = getCommonJsConfig(configs);
      const expected = `module.exports = {
\ttrailingComma: "es5",
\tprintWidth: 80,
\ttabWidth: 2,
\tsemi: true,
\tsingleQuote: true,
\tarrowParens: "always",
};`;

      assert.strictEqual(result, expected);
    });

    it('should handle nested objects in CommonJS config', () => {
      const configs = {
        trailingComma: 'es5',
        overrides: [
          {
            files: '*.ts',
            options: {
              parser: 'typescript',
            },
          },
        ],
      };
      const result = getCommonJsConfig(configs);
      const expected = `module.exports = {
\ttrailingComma: "es5",
\toverrides: [{"files":"*.ts","options":{"parser":"typescript"}}],
};`;

      assert.strictEqual(result, expected);
    });
  });

  describe('getModuleConfig', () => {
    it('should generate ES module config correctly', () => {
      const configs = {
        trailingComma: 'es5',
        printWidth: 80,
        tabWidth: 2,
        semi: true,
        singleQuote: true,
        arrowParens: 'always',
      };
      const result = getModuleConfig(configs);
      const expected = `export default {
\ttrailingComma: "es5",
\tprintWidth: 80,
\ttabWidth: 2,
\tsemi: true,
\tsingleQuote: true,
\tarrowParens: "always",
};`;

      assert.strictEqual(result, expected);
    });

    it('should handle nested objects in ES module config', () => {
      const configs = {
        trailingComma: 'es5',
        overrides: [
          {
            files: '*.ts',
            options: {
              parser: 'typescript',
            },
          },
        ],
      };
      const result = getModuleConfig(configs);
      const expected = `export default {
\ttrailingComma: "es5",
\toverrides: [{"files":"*.ts","options":{"parser":"typescript"}}],
};`;

      assert.strictEqual(result, expected);
    });
  });
});