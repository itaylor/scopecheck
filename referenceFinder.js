module.exports = referenceFinder;

var scopecore = require('./scopecore.js');
var estraverse = require('estraverse');
var fs = require('fs');

function referenceFinder(files, predefVars, excludeExprs, reporter){
  predefVars = predefVars || [];
  excludeExprs = excludeExprs || [];

  function findUndefinedReferences(scope){
    var refs = [];
    scope.references.forEach(function (ref){
      if(!ref.resolved && predefVars.indexOf(ref.identifier.name) == -1){
        if(ref.identifier._parent.type === 'VariableDeclarator' && ref.from.type !== 'global'){
          //Variable declarations in non global scope are ok,
          //even though they're marked by escope as 
          //not resolved.
        }else{
          refs.push(ref.identifier);  
        }        
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






