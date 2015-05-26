var esprima = require('esprima');
var escope = require('escope');

function scopecore(js, opts){
  var ast = esprima.parse(js, {range: true, loc: true});
  var scopes = escope.analyze(ast).scopes;
  var refs = [];

 if(opts.tree){
    var treeFns = Array.isArray(opts.scope) ? opts.tree : [opts.tree];
    treeFns.forEach(function (treeFn){
      var result = treeFn(ast);
      if(result !== undefined && result !== null){
        refs = refs.concat(result);
      }
    });
  }
  if(opts.scope){
    var scopeFns = Array.isArray(opts.scope) ? opts.scope : [opts.scope];
    scopeFns.forEach(function (scopeFn){
      scopes.forEach(function (scope){
        var result = scopeFn(scope, scopes[0]);
        if(result !== undefined && result !== null){
          refs = refs.concat(result);
        }
      });   
    });     
  } 
  return refs;
}

module.exports = scopecore;