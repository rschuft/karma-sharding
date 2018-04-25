var os = require('os')
var path = require('path')
var fs = require('fs')
var builder = require('xmlbuilder')
var pathIsAbsolute = require('path-is-absolute')

// concatenate test suite(s) and test description by default
function defaultNameFormatter (browser, result) {
  return result.suite.join(' ') + ' ' + result.description
}

var JUnitReporter = function (baseReporterDecorator, config, logger, helper, formatError) {
  var log = logger.create('reporter.junit')

// START OF CHANGE NEEDED ONLY FOR KARMA-SHARDING
  log.warn("Using karma-sharding junit reporter overlay.");
// END OF CHANGE NEEDED ONLY FOR KARMA-SHARDING

  var reporterConfig = config.junitReporter || {}
  var pkgName = reporterConfig.suite || ''
  var outputDir = reporterConfig.outputDir
  var outputFile = reporterConfig.outputFile
  var useBrowserName = reporterConfig.useBrowserName
  var nameFormatter = reporterConfig.nameFormatter || defaultNameFormatter
  var classNameFormatter = reporterConfig.classNameFormatter
  var properties = reporterConfig.properties

  var suites = {} // CHANGED BY KARMA-SHARDING
  var pendingFileWritings = 0
  var fileWritingFinished = function () {}
  var allMessages = []

  var aggregator = reporterConfig.browserId || 'id'; // ADDED BY KARMA-SHARDING
  var allBrowsers; // ADDED BY KARMA-SHARDING

  if (outputDir == null) {
    outputDir = '.'
  }

  outputDir = helper.normalizeWinPath(path.resolve(config.basePath, outputDir)) + path.sep

  if (typeof useBrowserName === 'undefined') {
    useBrowserName = true
  }

  baseReporterDecorator(this)

  this.adapters = [
    function (msg) {
      allMessages.push(msg)
    }
  ]

  var initializeXmlForBrowser = function (browser) {
    var timestamp = (new Date()).toISOString().substr(0, 19)
    var suite = suites[browser[aggregator]] = builder.create('testsuite') // CHANGED BY KARMA-SHARDING
    suite.att('name', browser.name)
      .att('package', pkgName)
      .att('timestamp', timestamp)
      .att('id', 0)
      .att('hostname', os.hostname())

    var propertiesElement = suite.ele('properties')
    propertiesElement.ele('property', {name: 'browser.fullName', value: browser.fullName})

    // add additional properties passed in through the config
    for (var property in properties) {
      if (properties.hasOwnProperty(property)) {
        propertiesElement.ele('property', {name: property, value: properties[property]})
      }
    }
  }

  var writeXmlForSuite = function (browserName, suiteKey) { // CHANGED BY KARMA-SHARDING
    var safeBrowserName = browserName.replace(/ /g, '_') // CHANGED BY KARMA-SHARDING
    var newOutputFile
    if (outputFile && pathIsAbsolute(outputFile)) {
      newOutputFile = outputFile
    } else if (outputFile != null) {
      var dir = useBrowserName ? path.join(outputDir, safeBrowserName)
        : outputDir
      newOutputFile = path.join(dir, outputFile)
    } else if (useBrowserName) {
      newOutputFile = path.join(outputDir, 'TESTS-' + safeBrowserName + '.xml')
    } else {
      newOutputFile = path.join(outputDir, 'TESTS.xml')
    }

    var xmlToOutput = suites[suiteKey] // CHANGED BY KARMA-SHARDING
    if (!xmlToOutput) {
      return // don't die if browser didn't start
    }

    pendingFileWritings++
    helper.mkdirIfNotExists(path.dirname(newOutputFile), function () {
      fs.writeFile(newOutputFile, xmlToOutput.end({pretty: true}), function (err) {
        if (err) {
          log.warn('Cannot write JUnit xml\n\t' + err.message)
        } else {
          log.debug('JUnit results written to "%s".', newOutputFile)
        }

        if (!--pendingFileWritings) {
          fileWritingFinished()
        }
      })
    })
  }

  var getClassName = function (browser, result) {
    var browserName = browser.name.replace(/ /g, '_').replace(/\./g, '_') + '.'

    return (useBrowserName ? browserName : '') + (pkgName ? pkgName + '.' : '') + result.suite[0]
  }

  // "run_start" - a test run is beginning for all browsers
  this.onRunStart = function (browsers) {
    // TODO(vojta): remove once we don't care about Karma 0.10
    browsers.forEach(initializeXmlForBrowser)
    allBrowsers = browsers; // ADDED BY KARMA-SHARDING
  }

  // "browser_start" - a test run is beginning in _this_ browser
  this.onBrowserStart = function (browser) {
    initializeXmlForBrowser(browser)
  }

  // "browser_complete" - a test run has completed in _this_ browser
  // START OF CONTENT CHANGED BY KARMA-SHARDING
  this.onBrowserComplete = function () {
    // moved to onRunComplete
  }
  // END OF CONTENT CHANGED BY KARMA-SHARDING

  // START OF CONTENT ADDED BY KARMA-SHARDING
  function createSuiteStats() {
    var suiteStats = {}
    allBrowsers.forEach(function (browser) {
      var suiteKey = browser[aggregator]
      var suiteStat = suiteStats[suiteKey]
      if (!suiteStat) {
        suiteStat = suiteStats[suiteKey] = {
          tests: 0,
          errors: 0,
          failures: 0,
          time: 0,
          browsers: [],
          suite: suites[suiteKey]
        };
      }
      suiteStat.browsers.push(browser)
      var result = browser.lastResult
      if (result) {
        suiteStat.tests += result.total ? result.total : 0
        suiteStat.errors += result.disconnected || result.error ? 1 : 0
        suiteStat.failures += result.failed ? result.failed : 0
        suiteStat.time = Math.max(suiteStat.time, (result.netTime || 0) / 1000)
      }
    })
    return suiteStats
  }
  // END OF CONTENT ADDED BY KARMA-SHARDING

// "run_complete" - a test run has completed on all browsers
  this.onRunComplete = function () {
    // START OF CONTENT CHANGED BY KARMA-SHARDING
    var suiteStats = createSuiteStats()
    for (var suiteKey in suiteStats) {
      var suiteStat = suiteStats[suiteKey]
      var suite = suiteStat.suite

      if (!suite) {
        continue // don't die if browser didn't start
      }

      suite.att('tests', suiteStat.tests)
      suite.att('errors', suiteStat.errors)
      suite.att('failures', suiteStat.failures)
      suite.att('time', suiteStat.time)

      suite.ele('system-out').dat(allMessages.join() + '\n')
      suite.ele('system-err')

      writeXmlForSuite(suiteStat.browsers[0].name, suiteKey)

      // Release memory held by the test suite.
      suites[suiteKey] = null
    }
    allMessages.length = 0
    allBrowsers = undefined

    // END OF CONTENT CHANGED BY KARMA-SHARDING
  }

  this.specSuccess = this.specSkipped = this.specFailure = function (browser, result) {
    var testsuite = suites[browser[aggregator]] // CHANGED BY KARMA-SHARDING

    if (!testsuite) {
      return
    }

    var spec = testsuite.ele('testcase', {
      name: nameFormatter(browser, result),
      time: ((result.time || 0) / 1000),
      classname: (typeof classNameFormatter === 'function' ? classNameFormatter : getClassName)(browser, result)
    })

    if (result.skipped) {
      spec.ele('skipped')
    }

    if (!result.success) {
      result.log.forEach(function (err) {
        spec.ele('failure', {type: ''}, formatError(err))
      })
    }
  }

  // wait for writing all the xml files, before exiting
  this.onExit = function (done) {
    if (pendingFileWritings) {
      fileWritingFinished = done
    } else {
      done()
    }
  }
}

JUnitReporter.$inject = ['baseReporterDecorator', 'config', 'logger', 'helper', 'formatError']

// PUBLISH DI MODULE
module.exports = {
  'reporter:junit': ['type', JUnitReporter]
}