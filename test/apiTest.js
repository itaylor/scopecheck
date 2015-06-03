var ScopeCheck = require('../index.js');

suite("Api Tests");

test('basic test of missing refs', 10, function (){
  var scopecheck = ScopeCheck();
  var file = __dirname + '/fixtures/basic.js';

  scopecheck.run([file]);
  var output = scopecheck.reporter().results();

  noErrors(output);
  var fileResults = output.results[file];
  equal(fileResults.length, 4);

  equal(fileResults[0].name, 'functionThatIsntDefined');
  deepEqual(fileResults[0].loc, {start: {line:11, column:0}, end: {line:11, column:23}});

  equal(fileResults[1].name, 'me');
  deepEqual(fileResults[1].loc, {start: {line: 12, column: 4}, end: {line: 12, column: 6}});

  equal(fileResults[2].name, 'nestedvar');
  deepEqual(fileResults[2].loc, {start: {line: 3, column: 2}, end: {line: 3, column: 11}});

  equal(fileResults[3].name, 'nestedvar');
  deepEqual(fileResults[3].loc, {start: {line: 6, column: 9}, end: {line: 6, column: 18}});

});

test('basic test adding an allowed reference', 8, function (){
  var scopecheck = ScopeCheck();
  var file = __dirname + '/fixtures/basic.js';

  var okRefs = scopecheck.okRefs().concat(['functionThatIsntDefined']);
  scopecheck
    .okRefs(okRefs)
    .run([file]);
  var output = scopecheck.reporter().results();

  noErrors(output);
  var fileResults = output.results[file];
  equal(fileResults.length, 3);

  equal(fileResults[0].name, 'me');
  deepEqual(fileResults[0].loc, {start: {line: 12, column: 4}, end: {line: 12, column: 6}});

  equal(fileResults[1].name, 'nestedvar');
  deepEqual(fileResults[1].loc, {start: {line: 3, column: 2}, end: {line: 3, column: 11}});

  equal(fileResults[2].name, 'nestedvar');
  deepEqual(fileResults[2].loc, {start: {line: 6, column: 9}, end: {line: 6, column: 18}});

});

test('File with no undefined references has no results', 2, function (){
  var scopecheck = ScopeCheck();
  var file = __dirname + '/fixtures/noUndefinedRefs.js';

  scopecheck.run([file]);
  var output = scopecheck.reporter().results();

  noErrors(output);
  var fileResults = output.results[file];
  equal(fileResults.length, 0);
});

test('Removing console from the okRefs marks console.log as an undefined reference', 4, function (){
  var scopecheck = ScopeCheck();
  var file = __dirname + '/fixtures/noUndefinedRefs.js';

  scopecheck
    .okRefs(scopecheck.okRefs().filter(function (name){return name != 'console';}))
    .run([file]);

  var output = scopecheck.reporter().results();

  noErrors(output);
  var fileResults = output.results[file];
  equal(fileResults.length, 1);
  equal(fileResults[0].name, 'console.log');
  deepEqual(fileResults[0].loc, {start: {line: 15, column: 0}, end: {line: 15, column: 11}});
});

test('HTML specific references are allowed by default', 2, function (){
  var scopecheck = ScopeCheck();
  var file = __dirname + '/fixtures/htmlDomApiCalls.js';

  scopecheck.run([file]);
  var output = scopecheck.reporter().results();

  noErrors(output);
  var fileResults = output.results[file];
  equal(fileResults.length, 0);
});

test('HTML specific references are not allowed if using node compatible references', 2, function (){
  var scopecheck = ScopeCheck();
  var file = __dirname + '/fixtures/htmlDomApiCalls.js';

  scopecheck
    .okRefs(ScopeCheck.predefinedReferences.node)
    .run([file]);
  var output = scopecheck.reporter().results();

  noErrors(output);
  var fileResults = output.results[file];

  equal(fileResults.length, 3);
});

test('Node specific references are not allowed by default', 2, function (){
  var scopecheck = ScopeCheck();
  var file = __dirname + '/fixtures/nodeApiCalls.js';

  scopecheck.run([file]);
  var output = scopecheck.reporter().results();

  noErrors(output);
  var fileResults = output.results[file];

  equal(fileResults.length, 4);
});

test('Node specific references are allowed when using node compatible references', 2, function (){
  var scopecheck = ScopeCheck();
  var file = __dirname + '/fixtures/nodeApiCalls.js';

  scopecheck
    .okRefs(ScopeCheck.predefinedReferences.node)
    .run([file]);
  var output = scopecheck.reporter().results();

  noErrors(output);
  var fileResults = output.results[file];
  equal(fileResults.length, 0);
});

test('Whole expression statements are returned when the first part of the expression is undefined', 5, function (){
  var scopecheck = ScopeCheck();
  var file = __dirname + '/fixtures/complexExpressions.js';

  scopecheck
    .run([file]);
  var output = scopecheck.reporter().results();

  noErrors(output);
  var fileResults = output.results[file];

  equal(fileResults.length, 3);
  equal(fileResults[0].name, 'foo.bar.baz');
  equal(fileResults[1].name, 'foo.bar.baz');
  equal(fileResults[2].name, 'foo.bar.biff');
});

test('Adding an okRef allows all child expressions', 2, function (){
  var scopecheck = ScopeCheck();
  var file = __dirname + '/fixtures/complexExpressions.js';

  scopecheck
    .okRefs(scopecheck.okRefs().concat(['foo']))
    .run([file]);
  var output = scopecheck.reporter().results();

  noErrors(output);
  var fileResults = output.results[file];

  equal(fileResults.length, 0);
});

test('Using excludes allows for selectively excluding child expressions', 4, function (){
  var scopecheck = ScopeCheck();
  var file = __dirname + '/fixtures/complexExpressions.js';

  scopecheck
    .excludes(['foo.bar.biff'])
    .run([file]);
  var output = scopecheck.reporter().results();

  noErrors(output);
  var fileResults = output.results[file];

  equal(fileResults.length, 2);
  equal(fileResults[0].name, 'foo.bar.baz');
  equal(fileResults[1].name, 'foo.bar.baz');
});



function noErrors(output){
  equal(Object.keys(output.exceptions).length, 0);
}

function print(thing){
  console.log(require('util').inspect(thing, {depth:10}));
}