const _ = require('lodash');

function getConfig(fullConfig) {
  // ensure we can manipulate config settings
  var config = fullConfig.sharding;
  config = typeof config === 'object' ? config : fullConfig.sharding = {};
  config.specMatcher = config.specMatcher ? config.specMatcher : /(spec|test)s?\.js/i;
  config.base = config.base ? config.base : '/base';
  config.sets = [];
  config.indexMap = {};
  return config;
}

function setupMiddleware(fullConfig) {
  // ensure we load our middleware before karma's middleware for sharding
  fullConfig.beforeMiddleware = fullConfig.beforeMiddleware ? fullConfig.beforeMiddleware : [];
  if (fullConfig.beforeMiddleware.indexOf('sharding') === -1) {
    fullConfig.beforeMiddleware.unshift('sharding');
  }
}

// https://stackoverflow.com/questions/8188548/splitting-a-js-array-into-n-arrays
function splitArray(flatArray, numCols){
  const maxColLength = Math.ceil(flatArray.length/numCols);
  const nestedArray = _.chunk(flatArray, maxColLength);
  let newArray = [];
  for (var i = 0; i < numCols; i++) {
    newArray[i] = nestedArray[i] || [];
  }
  return newArray;
}

function setupSets(config, basePath, files) {
  var specs = files.served.map(f => config.base + f.path.replace(basePath, ''))
                          .filter(p => config.specMatcher.test(p));
  config.sets = splitArray(specs, config.browserCount);
  var lastSet = config.sets && config.sets.length && config.sets[config.sets.length - 1];
  config.performSharding = (lastSet && lastSet.length);
}

function setupSharding(config, fullConfig, log) {
  if (!config.performSharding) {
    fullConfig.browsers = fullConfig.browsers.filter(function(item, pos, arr) {
      return arr.indexOf(item) === pos;
    });
    log.debug('reduced browser set to:', fullConfig.browsers);
  }
}

function setBrowserCount(config, browsers, log) {
  config.browserCount = browsers.length;
  log.info('sharding specs across', config.browserCount, config.browserCount === 1 ? 'browser' : 'browsers');
}

function handleFileListModified(fullConfig, config, files, log) {
  if (!config.sets.length) {
    setupSets(config, fullConfig.basePath, files);
    setupSharding(config, fullConfig, log);
    log.debug('config.sets:', config.sets);
  }
}

function handleBrowserRegister(config, browser, log) {
  config.indexMap[browser.id] = config.sets.shift();
}

function handleBrowserComplete(config, browser, log) {
  delete config.indexMap[browser.id];
}

function generateEmitter(emitter, fullConfig, config, log) {
  const originalEmit = emitter.emit;
  emitter.emit = function (event, entry) {
    switch(event) {
      case 'file_list_modified':
        handleFileListModified(fullConfig, config, entry, log);
        break;
      case 'browser_register':
        handleBrowserRegister(config, entry, log);
        break;
      case 'browser_complete':
        handleBrowserComplete(config, entry, log);
        break;
    }
    return originalEmit.apply(emitter, arguments);
  };
}

module.exports = function(/* config */fullConfig, emitter, logger) {
  var log = logger.create('framework:karma-sharding');
  var config = getConfig(fullConfig);
  setupMiddleware(fullConfig);
  setBrowserCount(config, fullConfig.browsers, log);
  // Intercepting the file_list_modified event as Vojta Jina describes here:
  // https://github.com/karma-runner/karma/issues/851#issuecomment-30290071
  generateEmitter(emitter, fullConfig, config, log);
};
