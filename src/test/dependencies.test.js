const { evaluatePackageDependencies } = require('../commands/vscodeHelper/dependencies');
const { assert } = require('assert');
import { describe, it }  from 'jest';

describe('evaluatePackageDependencies', () => {
  it('should return an empty object if packageJson is not provided', () => {
    const result = evaluatePackageDependencies(['express']);
    assert.deepStrictEqual(result, {});
  });

  // it('should return an empty object if dependencyArray is not an array', () => {
  //   const result = evaluatePackageDependencies('express', {});
  //   assert(result).toEqual({});
  // });

  // it('should return an empty object if dependencyArray is empty', () => {
  //   const result = evaluatePackageDependencies([], {});
  //   assert(result).toEqual({});
  // });

  // it('should return the correct dependencies from packageJson', () => {
  //   const packageJson = {
  //     dependencies: {
  //       express: '4.17.1',
  //     },
  //     devDependencies: {
  //       jest: '26.6.3',
  //     },
  //   };
  //   const result = evaluatePackageDependencies(
  //     ['express', 'jest'],
  //     packageJson
  //   );
  //   assert(result).toEqual({
  //     express: '4.17.1',
  //     jest: '26.6.3',
  //   });
  // });

  // it('should return null for dependencies not found in packageJson', () => {
  //   const packageJson = {
  //     dependencies: {
  //       express: '4.17.1',
  //     },
  //     devDependencies: {
  //       jest: '26.6.3',
  //     },
  //   };
  //   const result = evaluatePackageDependencies(['lodash'], packageJson);
  //   assert(result).toEqual({
  //     lodash: null,
  //   });
  // });

  // it('should handle errors gracefully and return null', () => {
  //   const result = evaluatePackageDependencies(null, null);
  //   assert(result).toBeNull();
  // });
});
