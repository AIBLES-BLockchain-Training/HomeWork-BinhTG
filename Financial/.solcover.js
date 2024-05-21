module.exports = {
    skipFiles: [],
    istanbulReporter: ["html", "lcov", "text-summary", "json", "cobertura"],
    dir: './coverage',
    configureYulOptimizer: true,
    measureStatementCoverage: true,
    measureFunctionCoverage: true,
    measureBranchCoverage: true,
    measureLineCoverage: true,
    mocha: {
      grep: "@skip-on-coverage",
      invert: true,
      reporter: 'spec',
      timeout: 20000
    }
  };
  