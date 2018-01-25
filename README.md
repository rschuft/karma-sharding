# karma-sharding

[![npm version](https://img.shields.io/npm/v/karma-sharding.svg?style=flat-square)](https://www.npmjs.com/package/karma-sharding)
[![NSP Status](https://nodesecurity.io/orgs/rschuft/projects/ed021736-08cf-4f6d-9796-4132029edac3/badge)](https://nodesecurity.io/orgs/rschuft/projects/ed021736-08cf-4f6d-9796-4132029edac3)
[![npm downloads](https://img.shields.io/npm/dm/karma-sharding.svg?style=flat-square)](https://www.npmjs.com/package/karma-sharding)
[![Build Status](https://travis-ci.org/rschuft/karma-sharding.svg?branch=master)](https://travis-ci.org/rschuft/karma-sharding)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square)](https://github.com/rschuft/karma-sharding)
[![Maintainability](https://api.codeclimate.com/v1/badges/3ef0f0244485d9ca0573/maintainability)](https://codeclimate.com/github/rschuft/karma-sharding/maintainability)
[![dependencies Status](https://david-dm.org/rschuft/karma-sharding/status.svg)](https://david-dm.org/rschuft/karma-sharding)
[![devDependencies Status](https://david-dm.org/rschuft/karma-sharding/dev-status.svg)](https://david-dm.org/rschuft/karma-sharding?type=dev)
[![optionalDependencies Status](https://david-dm.org/rschuft/karma-sharding/optional-status.svg)](https://david-dm.org/rschuft/karma-sharding?type=optional)

> Karma plugin to allow tests to be distributed across multiple browsers

## Notes

This is intended to avoid the memory usage problems seen with some browsers and numerous or memory intensive specs.
Lower your concurrency setting if total memory is a problem running in parallel processes.

You can pass configuration to override these defaults:

```javascript
{
  sharding: {
    specMatcher: /(spec|test)s?\.js/i,
    base: '/base',
    getSets: function(config, basePath, files) {
        // splitForBrowsers - some util function
        return splitForBrowsers(files.served)
            .map(oneBrowserSet => [someInitScript].concat(oneBrowserSet));
    }
  }
}
```

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

    frameworks: ['sharding'], // this will load the framework and beforeMiddleware

    preprocessors: {
      // source files, that you wanna generate coverage for
      // do not include tests or libraries
      // (these files will be instrumented by Istanbul)
      'src/**/*.js': ['coverage'] // coverage is loaded from karma-coverage by karma-sharding
    },

    // sharding replaces the coverage reporter inline to allow the preprocessor to run
    // preprocessor:coverage looks for reporter:coverage otherwise it would use a unique name
    reporters: ['progress', 'coverage'],

    browsers: ['ChromeHeadless', 'ChromeHeadless'] // this will split the tests into two sets
  });
};
```

----

For more information on Karma see the [homepage].


[homepage]: http://karma-runner.github.com
