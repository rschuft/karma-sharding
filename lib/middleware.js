const idParamExtractor = /\/\?id=(\d+)/;
const idCookieExtractor = /browser.id=(\d+)/;

function setBrowserIdCookie(request, response) {
  if (request.url.indexOf('/?id=') === 0) {
    const id = idParamExtractor.exec(request.url)[1];
    response.setHeader('Set-Cookie', `browser.id=${id};`);
  }
}

function getBrowserIdCookie(request) {
  return idCookieExtractor.exec(request.headers.cookie)[1];
}

function blankOutNonMembers(curSet, log, request, response) {
  if (curSet) {
    const url = request.url.split('?')[0];
    if (!curSet.find(u => u === url)) {
      log.debug('blanking out:', url);
      response.writeHead(200);
      response.end('');
      return 1;
    }
  }
}

function notInSet(config, log, request, response) {
  var id = getBrowserIdCookie(request);
  var curSet = config.indexMap[id];
  log.debug('browser', id, 'asked for', request.url);
  log.debug('checking against set:', curSet);
  return blankOutNonMembers(curSet, log, request, response);
}

module.exports = function(/* config */fullConfig, /* config.sharding */config, logger) {

  const log = logger.create('middleware:karma-sharding');

  return function (request, response, next) {
    setBrowserIdCookie(request, response);
    if (config.performSharding && config.specMatcher.test(request.url)) {
      if (notInSet(config, log, request, response) === 1) {
        return;
      }
    }
    return next();
  };

};
