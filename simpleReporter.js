 /* An extremely simple reporter that collects all results.  
  * Get the results by calling the results() function.
  */
module.exports = function (){
  var allResults = {};
  var exceptions = {};

  function batchStart(files){}
  function fileStart(file){}
  function fileComplete(err, file, results){
    if(err){
      exceptions[file] = err;
    }else{
      allResults[file] = results;
    }
  }
  function batchComplete(errCount) {}
  return {
    onBatchStart:batchStart,
    onFileStart:fileStart,
    onFileComplete:fileComplete,
    onBatchComplete:batchComplete,
    results: function results(){
      return {
        results:allResults,
        exceptions:exceptions
      }
    }
  }
}