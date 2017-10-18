// karma-coverage is loaded as an optional dependency
// if you install karma-sharding with --no-optional it will be skipped
let coverage;
try { coverage = require('karma-coverage'); }
catch (er) { coverage = {}; }

const sharding = {
  'framework:sharding': ['type', require('./framework')],
  'middleware:sharding': ['factory', require('./middleware')]
};

// if karma-coverage is loaded override reporter:coverage with our version
if (coverage['reporter:coverage']) {
  sharding['reporter:coverage'] = ['type', require('./reporter')];
}

module.exports = Object.assign({}, coverage, sharding);
