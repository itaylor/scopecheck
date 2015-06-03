(function (){
  var myObj = 'biff';

  function toplevel(){
    setTimeout(function (){
      myObj.toString();
    }, 100);

    var d = new Date();
    myObj = 'blah';
  }
  toplevel();
})();

console.log('console');