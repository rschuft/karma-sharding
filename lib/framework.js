var _ = require('lodash');

module.exports = function(
  /* config */fullConfig,
  /* config.browsers */browsers,
  /* config.basePath */basePath,
  /* config.sharding */config,
  emitter, customFileHandlers, logger) {

  // TODO: setup sets of specs based on browser distribution

  var log = logger.create('framework:karma-sharding');

  // ensure we can manipulate config settings
  config = typeof config === 'object' ? config : fullConfig.sharding = {};
  config.specMatcher = config.specMatcher ? config.specMatcher : /(spec|test)s?\.js/i;
  config.base = config.base ? config.base : '/base';

  // force one browser at a time if we're using sharding
  fullConfig.concurrency = 1;

  // ensure we load our middleware before karma's middleware for sharding
  fullConfig.beforeMiddleware = fullConfig.beforeMiddleware ? fullConfig.beforeMiddleware : [];
  if (fullConfig.beforeMiddleware.indexOf('sharding') === -1) {
    fullConfig.beforeMiddleware.unshift('sharding');
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

  config.browserCount = browsers.length;
  log.info('sharding specs across', config.browserCount, config.browserCount === 1 ? 'browser' : 'browsers');

  // Intercepting the file_list_modified event as Vojta Jina describes here:
  // https://github.com/karma-runner/karma/issues/851#issuecomment-30290071
  var originalEmit = emitter.emit;
  emitter.emit = function (event, entry) {
    switch(event) {
      case 'file_list_modified':
        if (!config.sets) {
          var files = entry;
          var specs = files.served.map(f => config.base + f.path.replace(basePath, ''))
                                  .filter(p => config.specMatcher.test(p));
          config.sets = splitArray(specs, config.browserCount);
          var lastSet = config.sets && config.sets.length && config.sets[config.sets.length - 1];
          var hasSets = lastSet && lastSet.length;
          config.performSharding = hasSets;
          if (!hasSets) {
            fullConfig.browsers = browsers.filter(function(item, pos, arr) {
              return arr.indexOf(item) === pos;
            });
            log.debug('reduced browser set to:', fullConfig.browsers);
          }
          log.debug('performSharding', config.performSharding, 'sets:', config.sets);
        }
        break;
      case 'browser_register':
        var browser = entry;
        log.debug('recording browser', browser.id);
        const indexIsNum = typeof config.browserIndex === 'number';
        config.browserIndex = indexIsNum ? config.browserIndex + 1 : 0;
        config.currentSet = config.sets[config.browserIndex];
        config.currentBrowser = browser.id;
        break;
      case 'browser_complete':
        var browser = entry;
        log.debug('stopping recording for browser', browser.id);
        delete config.currentBrowser;
        break;
    }
    return originalEmit.apply(emitter, arguments);
  };

};
