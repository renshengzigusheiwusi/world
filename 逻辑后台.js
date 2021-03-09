var arangojs=require('arangojs');
var Database =arangojs.Database;
var aql=arangojs.aql;
var db = new Database('http://127.0.0.1:8529');
db.useBasicAuth("root","104521");
db.useDatabase("truth");
var map=db.graph("map");
exports.query=async function(aql){
  return db.query(aql);
}
async function 建立关联(from,item,type){
  if(item.type=='蕴含'){
    let f=item.from;
    let to=item.to;
    let k=await map.vertexCollection("knowledge").save(item);
    await 建立关联(k,f,'前因');
    await 建立关联(k,to,'后果');
  }
  else if(item.type=='info'){
    let r1=  await db.query(`
        for x in object
        filter x.type=='info'&&x.info=='${item.info}'
        return x
      `);
    if(r1._result.length==0){
      let o=await map.vertexCollection("object").save({
        type:"info",
        info:item.info
      })
      await map.edgeCollection("obg_konw").save({
        type:type
      },o._id,from);
    }
    else{
      let id=r1._result[0]._id;
      await map.edgeCollection("obg_konw").save({
        type:type
      },id,from);
    }
  }
  else if(item.type=='且'){
    let arr=item.arr;
    for(var i=0;i<arr.length;++i){
      await 建立关联(from,arr[i],type);
    }
  }
  else if(item.type=='或'){
    let arr=item.arr;
    for(var i=0;i<arr.length;++i){
      await 建立关联(from,arr[i],type);
    }
  }
  // for(var i=0;i<tos.length;++t){
  //   //let _o=await map.vertexCollection("object").save(from.tos[t]);
  //     await map.edgeCollection("obg_konw").save({},_o._id,_k._id);
  //   }
  //}
}
exports.全写入=async function(knows){
  for(var i=0;i<knows.length;++i){
    await 建立关联(null,knows[i]);
    // let k=knows[i];
    // if(k.type=="蕴含"){
    //   let f=k.from;
    //   let to=k.to;
    //   let _k=await map.vertexCollection("knowledge").save(k);
    //   if(f.type=='且'){
    //
    //   }
    //   for(var t=0;t<f.arr.length;++t){
    //   let _o=await map.vertexCollection("object").save(f.arr[t]);
    //     await map.edgeCollection("obg_konw").save({},_o._id,_k._id);
    //   }
    //   for(var t=0;t<to.arr.length;++t){
    //   let _o=await map.vertexCollection("object").save(to.arr[t]);
    //     await map.edgeCollection("obg_konw").save({},_o._id,_k._id);
    //   }
    // }
  }
}
























//
