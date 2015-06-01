function toplevel(){
  //assignment of an undefined reference;
  nestedvar = "foo";
  function secondlevel(){
    //usage of an undefined reference;
    '' + nestedvar;
    var okVar = "foo";
  }
}
//call of an undefined function from global scope
functionThatIsntDefined();
var me = "anything";