foo.bar.baz = function (){
  return {'thing':"stuff"};
}
foo.bar.baz().thing;
foo.bar.biff();

var thing = {
  child:{
    blah:function (){
    }
  }
};
thing.child.blah();
thing['child'].blah();