// ensure karma-coverage is loaded to provide the coverage preprocessor
// and to register in-memory-report with istanbul
module.exports = Object.assign({}, require('karma-coverage'), {
  'reporter:sharding': ['type', require('./reporter')],
  'middleware:sharding': ['factory', require('./middleware')],
  'framework:sharding': ['type', require('./framework')]
});
