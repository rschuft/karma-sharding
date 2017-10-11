module.exports = function(/* config */fullConfig, /* config.sharding */config, logger) {

  var log = logger.create('middleware:karma-sharding');

  return function (request, response, next) {
    if (config.performSharding && config.specMatcher.test(request.url)) {
      log.debug('browser index', config.browserIndex, 'id', config.currentBrowser, 'asked for', request.url);
      log.debug('checking against set:', config.currentSet);
      // blank out spec files that are not in the intended set
      const url = request.url.split('?')[0];
      if (!config.currentSet.find(u => u === url)) {
        log.debug('blanking out:', url);
        response.writeHead(200);
        return response.end('');
      }
    }
    return next();
  };

};
