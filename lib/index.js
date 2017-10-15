// ensure karma-coverage is loaded to provide the coverage preprocessor
// and to register in-memory-report with istanbul
module.exports = Object.assign({}, require('karma-coverage'), {
  // unique to sharding
  'framework:sharding': ['type', require('./framework')],
  'middleware:sharding': ['factory', require('./middleware')],

  // overrides the original - name required to trigger preprocessor
  'reporter:coverage': ['type', require('./reporter')]
});
