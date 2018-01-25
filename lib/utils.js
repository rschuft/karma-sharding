const _ = require('lodash');

// modified from example at:
// https://stackoverflow.com/questions/8188548/splitting-a-js-array-into-n-arrays
function splitArray(flatArray, numCols){
  var maxColLength = Math.ceil(flatArray.length/numCols);
  var nestedArray = _.chunk(flatArray, maxColLength);
  for (var i = nestedArray.length; i < numCols; i++) {
    nestedArray.push([]);
  }
  return nestedArray;
}

function isSpecFile(url, matcher) {
  return (
    url.indexOf('/bower_components/') === -1 &&
    url.indexOf('/node_modules/') === -1 &&
    matcher.test(url)
  );
}

module.exports = { isSpecFile, splitArray };
