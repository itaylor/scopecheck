#! /usr/bin/env node
var program = require('commander');
var glob = require('glob');
var scopecore = require('./scopecore.js');

function collect(val, memo) {
  memo.push(val);
  return memo;
}
var package = require('./package.json');

program
  .version(package.version)
  .usage('[options] <fileglob>')
  .action(function (fileglob){
    program.fileglob = fileglob;
    program.files = glob.sync(fileglob);
  })
  .option('-a, --add-predef-var <value>', 'adds a variable that should be considered as defined', collect, [])
  .option('-r, --remove-predef-var <value>', 'remove this from the list of variables considered as defined', collect, [])
  .option('-p, --print-predef-vars', 'Prints all the built-in variables that are considered as defined')
  .option('-e, --exclude <value>', 'A missing reference to exclude from the list of errors.', collect, [])
  .option('-s, --suppress-non-errors', 'Suppress messages about each file processed.')
  .option('-n, --node-js-vars-only', 'Only add predefVars that are needed for nodes.js')
  .on('--help', function(){
    console.log('  Examples:');
    console.log('');
    console.log('    Find all missing refs in js files.  Allow that $ and jQuery are defined.');
    console.log('    $ scopecheck -a "$" -a jQuery "**/*.js"');
    console.log('');
    console.log('    Find all missing refs in a single file, include debugger statements as errors');
    console.log('    $ scopecheck -r debugger foo/bar.js');
    console.log('');
    console.log('    Report console statements as missing refs, except for console.error');
    console.log('    $ scopecheck -r console -e "console.error" "**/*.js"');
    console.log('');
  })
  .parse(process.argv);

var ScopeCheck = require('./index.js');
var scopecheck = ScopeCheck();
if(program.nodeJsVarsOnly){
  scopecheck.okRefs(ScopeCheck.predefinedReferences.node);
}

var okRefs = scopecheck.okRefs();
okRefs = okRefs.concat(program.addPredefVar);
if(program.removePredefVar){
  okRefs = okRefs.filter(function (v){
    return program.removePredefVar.indexOf(v) == -1;
  });
}

if(program.printPredefVars){
  console.log(JSON.stringify(okRefs));
  process.exit(0);
}

if(!program.files ||!program.files.length){
  console.log('No files found.  If you\'re using a glob, make sure you\'ve enclosed it in quotes.');
  console.log('  Example: scopecheck "**/*.js"');
  process.exit(1);
}

scopecheck
  .okRefs(okRefs)
  .reporter(ScopeCheck.reporters.cli({showNonErrorFiles:!program.suppressNonErrors}))
  .excludes(program.exclude)
  .run(program.files);
