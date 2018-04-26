// karma-coverage is loaded as an optional dependency
// if you install karma-sharding with --no-optional it will be skipped
let coverage;
try { coverage = require('karma-coverage'); }
catch (er) { coverage = {}; }

let junit;
try { junit = require('karma-junit-reporter'); }
catch (er) { junit = {}; }

const sharding = {
  'framework:sharding': ['type', require('./framework')],
  'middleware:sharding': ['factory', require('./middleware')]
};

// if karma-coverage is loaded override reporter:coverage with our version
if (coverage['reporter:coverage']) {
  sharding['reporter:coverage'] = ['type', require('./reporter')];
}

// if karma-junit-reporter is loaded override reporter:junit with our version
if (junit['reporter:junit']) {
  sharding['reporter:junit'] = require('./junitReporter')['reporter:junit'];
}

module.exports = Object.assign({}, coverage, sharding);
