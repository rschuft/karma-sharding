const idParamExtractor = /\/\?id=(\d+)/;
const idCookieExtractor = /browser.id=(\d+)/;

function setBrowserIdCookie(request, response) {
  if (request.url.indexOf('/?id=') === 0) {
    const id = idParamExtractor.exec(request.url)[1];
    response.setHeader('Set-Cookie', `browser.id=${id};`);
  }
}

function getBrowserIdCookie(request) {
  const match = idCookieExtractor.exec(request.headers.cookie);
  return match && match.length && match[1];
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
  if (id) {
    var curSet = config.indexMap[id];
    log.debug('browser', id, 'asked for', request.url);
    log.debug('checking against set:', curSet);
    return blankOutNonMembers(curSet, log, request, response);
  }
}

function isSpecFile(url, matcher) {
  return (
    url.indexOf('/bower_components/') === -1 &&
    url.indexOf('/node_modules/') === -1 &&
    matcher.test(url)
  );
}

module.exports = function(/* config */fullConfig, /* config.sharding */config, logger) {

  const log = logger.create('middleware:karma-sharding');

  return function (request, response, next) {
    setBrowserIdCookie(request, response);
    if (config.performSharding && isSpecFile(request.url, config.specMatcher)) {
      if (notInSet(config, log, request, response) === 1) {
        return;
      }
    }
    return next();
  };

};
