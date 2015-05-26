module.exports = referenceFinder;

var scopecore = require('./scopecore.js');
var estraverse = require('estraverse');
var fs = require('fs');


function isUndefinedReference(ref, globalScope){
  //This looks like a bug in escope... 
  //ref.resolved is not defined when a var is declared in global scope.
  // For instance, it won't detect foo as being resolved in the below code.
  // var foo = 'a';
  // function bar(){
  //   return foo + 'b'
  // }
  // bar();
  //TODO: PR to escope to fix the root cause of this bug
  if(ref.resolved){
    return false;
  }
  var variable;
  if(variable = globalScope.set.get(ref.identifier.name)) {
    ref.resolved = variable;
    return false;
  } 
  return true;
}

function referenceFinder(files, predefVars, excludeExprs, reporter){
  predefVars = predefVars || [];
  excludeExprs = excludeExprs || [];

  function findUndefinedReferences(scope, globalScope){
    var refs = [];
    scope.references.forEach(function (ref){
      if(isUndefinedReference(ref, globalScope) &&
        predefVars.indexOf(ref.identifier.name) == -1){
        refs.push(ref.identifier);
      }
    });
    return refs;
  }

  var errCount = 0;
  reporter.onBatchStart(files);

  files.forEach(function (file){
    reporter.onFileStart(file);
    var value = fs.readFileSync(file, {encoding:'utf-8'});
    try{
      var result = scopecore(value, {
        scope:findUndefinedReferences,
        tree:parentLinkAstNodes    
      });
    }catch(e){
      reporter.onFileComplete(e, file, []);
      errCount++;
      return;
    }

    result = formatMemberExprs(value, result);
    result = result.filter(function (member){
      return !(excludeExprs.indexOf(member.name) != -1);
    });
    if(result.length > 0){
      errCount++;
    }
    reporter.onFileComplete(null, file, result);
  });
  reporter.onBatchComplete(errCount);
}

function parentLinkAstNodes(ast){
  estraverse.traverse(ast, {
    leave: function (node, parent){
      node._parent = parent;
    }
  });
}

function formatMemberExprs(js, refs){
  return refs.map(function (node){
    var p = node._parent;
    if(p && p.type === "MemberExpression"){
      while (p && p._parent && p._parent.type === "MemberExpression"){
        p = p._parent;
      }
      var exprVal = js.substring(p.range[0], p.range[1]);
      return {name: exprVal, loc:p.loc}; 
    }else{
      return {name: node.name, loc:node.loc};
    }
  });
}






