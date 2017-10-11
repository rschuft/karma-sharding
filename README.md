# karma-sharding

[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square)](https://github.com/rschuft/karma-sharding)
 [![npm version](https://img.shields.io/npm/v/karma-sharding.svg?style=flat-square)](https://www.npmjs.com/package/karma-sharding) [![npm downloads](https://img.shields.io/npm/dm/karma-sharding.svg?style=flat-square)](https://www.npmjs.com/package/karma-sharding)

> Allows Karma tests to be distributed across multiple sequentially loaded browsers

---

## Installation

The easiest way is to install `karma-sharding` as a `devDependency`,
by running

```bash
npm install karma karma-sharding --save-dev
```

## Examples

### Basic

```javascript
// karma.conf.js
module.exports = function(config) {
  config.set({
    files: [
      'src/**/*.js',
      'test/**/*.js'
    ],

    // sharding replaces the coverage reporter which generates the coverage
    reporters: ['progress', 'sharding'],

    frameworks: ['sharding'], // this will load the framework and beforeMiddleware

    preprocessors: {
      // source files, that you wanna generate coverage for
      // do not include tests or libraries
      // (these files will be instrumented by Istanbul)
      'src/**/*.js': ['coverage'] // coverage is loaded from karma-coverage by karma-sharding
    },

    // optionally, configure the reporter as per karma-coverage
    coverageReporter: {
      type : 'html',
      dir : 'coverage/'
    },

    browsers: ['ChromeHeadless', 'ChromeHeadless'] // this will split the tests into two sets
  });
};
```

----

For more information on Karma see the [homepage].


[homepage]: http://karma-runner.github.com
