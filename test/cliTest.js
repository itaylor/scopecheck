var ScopeCheck = require('../index.js');

var cp = require('child_process');

function exec(cmd, callback){
  cp.exec('node ../cli.js '+ cmd, {cwd:__dirname}, callback);
}

suite("CLI tests");

function expectError(actual, expected, msg){
  if(expected === 0){
    ok(!actual);
  }else{
    equal(actual.code, expected, msg);
  }  
}

asyncTest('basic test of missing refs', 3, function (done){
  exec('./fixtures/basic.js', function (err, stdout, stderr){
    expectError(err, 1);
    equal(stdout, 'Starting run with 1 files.\n./fixtures/basic.js 🚫\n  functionThatIsntDefined 11:0\n  me 12:4\n  nestedvar 3:2 6:9\nFiles with errors: 1\n')
    ok(!stderr);
    done();
  });
});

asyncTest('globbing test', 3, function (done){
  exec('"./fixtures/*.js"', function (err, stdout, stderr){
    expectError(err, 3);
    equal(stdout, 'Starting run with 5 files.'
     + '\n./fixtures/basic.js 🚫' 
     + '\n  functionThatIsntDefined 11:0' 
     + '\n  me 12:4' 
     + '\n  nestedvar 3:2 6:9'
     + '\n./fixtures/complexExpressions.js 🚫'
     + '\n  foo.bar.baz 1:0 4:0'
     + '\n  foo.bar.biff 5:0'
     + '\n./fixtures/htmlDomApiCalls.js ✓'
     + '\n./fixtures/noUndefinedRefs.js ✓'
     + '\n./fixtures/nodeApiCalls.js 🚫'
     + '\n  module.exports 1:0'
     + '\n  __dirname 1:17'
     + '\n  require 2:0'
     + '\n  process.exit 3:0'
     + '\nFiles with errors: 3\n');
    ok(!stderr);
    done();
  });
});

asyncTest('-s cli option, suppress file success messages', 3, function (done){
  exec('-s "./fixtures/noUndefinedRefs.js"', function (err, stdout, stderr){
    expectError(err, 0);
    equal(stdout, 'Starting run with 1 files.'
     + '\nNo errors detected.\n');
    ok(!stderr);
    done();
  });
});

asyncTest('-n cli option, Node.js references support', 3, function (done){
  exec('-n "./fixtures/nodeApiCalls.js"', function (err, stdout, stderr){
    expectError(err, 0);
    equal(stdout, 'Starting run with 1 files.'
     + '\n./fixtures/nodeApiCalls.js ✓'
     + '\nNo errors detected.\n');
    ok(!stderr);
    done();
  });
});

asyncTest('-r cli option, remove references', 3, function (done){
  exec('-n -r process -r require "./fixtures/nodeApiCalls.js"', function (err, stdout, stderr){
    expectError(err, 1);
    equal(stdout, 'Starting run with 1 files.'
     + '\n./fixtures/nodeApiCalls.js 🚫'
     + '\n  require 2:0'
     + '\n  process.exit 3:0'
     + '\nFiles with errors: 1\n');
    ok(!stderr);
    done();
  });
});

asyncTest('-a cli option, add references', 3, function (done){
  exec('-n -a foo ./fixtures/complexExpressions.js', function (err, stdout, stderr){
    expectError(err, 0);
    equal(stdout, 'Starting run with 1 files.'
     + '\n./fixtures/complexExpressions.js ✓'
     + '\nNo errors detected.\n');
    ok(!stderr);
    done();
  });
});

asyncTest('-e cli option, add exclude', 3, function (done){
  exec('-e foo.bar.baz ./fixtures/complexExpressions.js', function (err, stdout, stderr){
    expectError(err, 1);
    equal(stdout, 'Starting run with 1 files.'
     + '\n./fixtures/complexExpressions.js 🚫'
     + '\n  foo.bar.biff 5:0'
     + '\nFiles with errors: 1\n');
    ok(!stderr);
    done();
  });
});

asyncTest('-p cli option, print allowed references', 3, function (done){
   exec('-n -p', function (err, stdout, stderr){
    expectError(err, 0);
    equal(stdout, JSON.stringify([ 
        'NaN',
        'Infinity',
        'undefined',
        'eval',
        'parseInt',
        'parseFloat',
        'isNaN',
        'decodeURI',
        'decodeURIComponent',
        'encodeURI',
        'encodeURIComponent',
        'Object',
        'Function',
        'Array',
        'String',
        'Boolean',
        'Number',
        'Date',
        'RegExp',
        'Error',
        'EvalError',
        'RangeError',
        'ReferenceError',
        'SyntaxError',
        'TypeError',
        'URIError',
        'Math',
        'JSON',
        'debugger',
        'ArrayBuffer',
        'Int8Array',
        'Uint8Array',
        'Uint8ClampedArray',
        'Int16Array',
        'Uint16Array',
        'Int32Array',
        'Uint32Array',
        'Float32Array',
        'Float64Array',
        'DataView',
        'global',
        'process',
        'GLOBAL',
        'root',
        'Buffer',
        'setTimeout',
        'setInterval',
        'clearTimeout',
        'clearInterval',
        'setImmediate',
        'clearImmediate',
        'console',
        'module',
        'require',
        '__dirname',
        '__filename' ])+'\n');
    ok(!stderr);
    done();
  });
});

asyncTest('unparseable files are poo', 3, function (done){
   exec('./fixtures/invalid.file', function (err, stdout, stderr){
    expectError(err, 1);
    equal(stdout, 'Starting run with 1 files.'
      + '\n./fixtures/invalid.file 💩'
      + '\nFiles with errors: 1\n');
   
    equal(stderr, 'Line 1: Unexpected token ILLEGAL { [Error: Line 1: Unexpected token ILLEGAL]'
      + '\n  index: 0,'
      + '\n  lineNumber: 1,'
      + '\n  column: 1,'
      + '\n  description: \'Unexpected token ILLEGAL\' }\n');
    done();
  });
});

function noErrors(output){
  equal(Object.keys(output.exceptions).length, 0);
}

function print(thing){
  console.log(require('util').inspect(thing, {depth:10}));
}