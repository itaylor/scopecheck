var finder = require('./referenceFinder.js');

function scopecheck(opts){
  opts = opts || {};
  var me = {};
  var okRefs = scopecheck.predefinedReferences.html;
  var reporter = scopecheck.reporters.simple();
  var runner = finder;
  var excludes = [];
  me.reporter = function (myReporter){
    if(arguments.length === 0){
      return reporter;
    }
    reporter = myReporter;
    return me;
  }
  me.okRefs = function (myOkRefs){
    if(arguments.length === 0){
      return okRefs;
    }
    okRefs = myOkRefs;
    return me;
  }
  me.runner = function (myRunner){
    if(arguments.length === 0){
      return runner;
    }
    runner = myRunner;
    return me;
  }
  me.excludes = function (myExcludes){
    if(arguments.length === 0){
      return excludes;
    }
    excludes = myExcludes;
    return me;
  }
  me.run = function run(fileNames){
    runner(fileNames, okRefs, excludes, reporter )
    return reporter;
  }
  return me;
}
scopecheck.predefinedReferences = require('./predefinedReferences.js');
scopecheck.reporters = {
  cli:require('./cliReporter.js'),
  simple:require('./simpleReporter.js')
}
module.exports = scopecheck;