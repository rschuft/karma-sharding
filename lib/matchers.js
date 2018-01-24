function isSpecFile(url, matcher) {
  return (
    url.indexOf('/bower_components/') === -1 &&
    url.indexOf('/node_modules/') === -1 &&
    matcher.test(url)
  );
}

module.exports = { isSpecFile };
