var colors = require('colors/safe');
/** A Reporter that prints the results to the console for CLI usage */
module.exports = function (opts){
    
  function batchStart(files){
    console.log('Starting run with '+ files.length + ' files.');
  }

  function fileStart(file){
    if(opts.showNonErrorFiles){
      process.stdout.write(file);
    }
  }

  function fileComplete(err, file, results){
    if(err){
      if(!opts.showNonErrorFiles){
        process.stdout.write(file); 
      } 
      process.stdout.write(' ' + colors.red('💩') + '\n');
      console.error(err.message, err);
    }
    else if((!results || results.length === 0) && opts.showNonErrorFiles){
      process.stdout.write(' ' + colors.green('✓') + '\n');
    }
    else if(results && results.length){
      if(!opts.showNonErrorFiles){
        process.stdout.write(file); 
      } 
      process.stdout.write(' ' + colors.red('🚫') + '\n')
      console.log('  ' + colors.red(formatCollapsedMembers(collapseMultiLineLocs(results)).join('\n  ')));
    }
  }

  function batchComplete(errCount){
    if(errCount){
      console.log('Files with errors: ' + colors.red(errCount));
    }
    else{
      console.log(colors.green('No errors detected.'));
    }
    process.exit(errCount);
  }

  function formatLoc(loc){
    return loc.start.line + ':' + loc.start.column;
  }

  function formatCollapsedMembers(members){
    return members.map(function (member){
      return member.name + ' ' + member.locs.map(formatLoc).join(' ');
    });
  }

  function collapseMultiLineLocs(memberExprs){
    var tmp = {};
    memberExprs.forEach(function (member){
      if(tmp[member.name]){
        tmp[member.name].push(member.loc);
      }else{
        tmp[member.name] = [member.loc];
      }
    });
    return Object.keys(tmp).map(function (name){
      return {name:name, locs:tmp[name]};
    });
  }
  return {
    onBatchStart:batchStart,
    onFileStart:fileStart,
    onFileComplete:fileComplete,
    onBatchComplete:batchComplete
  }
}