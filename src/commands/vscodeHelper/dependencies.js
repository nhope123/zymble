const { processErrorMessage } = require('./message');

const evaluatePackageDependencies = (dependencyArray, packageJson) => {
  try {
    if (
      !packageJson ||
      !Array.isArray(dependencyArray) ||
      dependencyArray.length === 0
    ) {
      return {};
    }

    const { dependencies, devDependencies } = packageJson;
    return dependencyArray.reduce((results, dependency) => {
      results[dependency] =
        dependencies[dependency] || devDependencies[dependency] || null;
      return results;
    }, {});
  } catch (error) {
    processErrorMessage(
      `Error evaluating package dependencies: ${error.message}`,
      'minor'
    );
    return null;
  }
};

module.exports = {
  evaluatePackageDependencies,
};
