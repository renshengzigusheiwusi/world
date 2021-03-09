//蕴含 等价 量词
var db=require("./逻辑后台.js");
var env=[];
var knows=[];
var 监听=[];
var 假设arr=[];
var memory=[];
async function newinfo(info,result,假设){
  if(假设){
    假设arr.push(info);
  }
  else{
    env.push(info);
  //  result.push(info);
  }

  if(info.value==0){
    return;
  }

  // for(var i=0;i<监听.length;++i){
  //   if(info.info==监听[i].info){
  //     console.log("调用监听");
  //     let temp=监听.splice(i,1);
  //     await  temp[0].callback(info,result,假设);
  //   }
  // }
}
function 添加监听(info){
  监听.push({
    type:"info",
    info:info.info,
    callback:info.callback
  })
}
function 目标演绎(target){
  //第一步是获取与目标相关的知识
}
async function 旧知识新推(know,result){
  await 演绎([know],result);
}
async function 获取相关知识_info(obj){
//  console.log(obj);
  //对于不同的obj 只要给出不同的 该函数即可
  let id_r=await db.query(`
    for x in object
    filter x.info=='${obj.info}'
    return x
    `);
  if(id_r._result.length==0){
    return [];
  }
  let id=id_r._result[0]._id;
  let know_r=await db.query(`
    for x in obg_konw
    filter x._from=='${id}'
      for y in knowledge
      filter y._id==x._to
      return y
    `);
  let know=know_r._result;
  return know;
}
async function 按类型判断真假(item,infos){
  let b;
  if(item._type=='env'){
    b=await 判断真假_env(item,infos);
  }
  if(item.type=="info"){
    b=await 判断真假_info(item,假设);
    //console.log(b);
  }
  else if(item.type=='且'){
    b=await 判断真假_且(item,假设);
  }
  else if(item.type=='或'){
      b=await 判断真假_或(item,假设);
  }
  else if(item.type=='非'){
    b=await 判断真假_非(item,假设);
  }
  return b;
}
async function 判断真假_info(info,假设){
  //检测环境
  if(假设){
    for(var i=假设arr.length-1;i>-1;--i){
      if(假设arr[i].type=='info'&&假设arr[i].info==info.info){
        info.value=假设arr[i].value;
        if(假设arr[i].value==1){
          return {
            type:"info",
            value:1,
            reason:[info]
          };
        }
        else if(假设arr[i].value==-1){
          return {
            type:"info",
            value:-1,
            reason:[info]
          };
        }
        else{
          假设arr[i].value=0;
          return {
            type:"info",
            value:0,
            reason:[info]
          };
        }
      }
    }
  }


  for(var i=env.length-1;i>-1;--i){
    if(env[i].type=='info'&&env[i].info==info.info){
      info.value=env[i].value;
      if(env[i].value==1){
        return {
          type:"info",
          value:1,
          reason:[info]
        };
      }
      else if(env[i].value==-1){
        return {
          type:"info",
          value:-1,
          reason:[info]
        };
      }
      else{
        env[i].value=0;
        return {
          type:"info",
          value:0,
          reason:[info]
        };
      }
    }
  }
  //检测obj表
  let r1=await db.query(`
    for x in object
    filter x.type=='info'&&
    x.info=="${info.info}"
    return x
    `);
    for(var i=0;i<r1._result.length;++i){
      if(r1._result[i].value===undefined){
        r1._result[i].value=0;
      }
      info.value=r1._result[i].value;

      if(r1._result[i].value==1){
        env.push(r1._result[i]);
        return {
          type:"info",
          value:1,
          reason:[info]
        };
      }
      else if(r1._result[i].value==-1){
        env.push(r1._result[i]);
        return {
          type:"info",
          value:-1,
          reason:[info]
        };
      }
      else{
        r1._result[i].value=0;
        env.push(r1._result[i]);
        return {
          type:"info",
          value:0,
          reason:[info]
        };
      }
    }
}
async function 判断真假_env(info,infos){
  //检测环境
  for(var i=0;i<infos.length;++i){
    if(infos[i]._type=='env'){
      if(info.info==infos[i].info){
        return {
          _type:'env',
          value:1
        }
      }
    }
  }
  return {
    _type:'env',
    value:-1
  }
}
async function 判断真假_且(info,假设){
  let arr=info.arr;
  for(var i=0;i<arr.length;++i){
    let item=arr[i];
    let b=await 按类型判断真假(item,假设);
    if(b.value!=1){
      return {
        type:"且",
        value:b.value,
        reason:b.reason
      }
    }
  }
  return {
    type:"且",
    value:1,
    reason:[]
  }
}
async function 判断真假_或(info,假设){
  let arr=info.arr;
  let allfalse=true;
  let depends=[];
  let b;
  for(var i=0;i<arr.length;++i){
    let item=arr[i];
    let b=await 按类型判断真假(item,假设);
    if(b.value==1){
      return {
        type:"或",
        value:1,
        reason:b.reason
      }
    }
    else if(b.value==-1){

    }
    else if(b.value==0){
      allfalse=false;
      depends=depends.concat(b.reason);
    }
  }
  if(allfalse){
    return {
      type:"或",
      value:-1
    }
  }
  else{
    return {
      type:"或",
      value:0,
      reason:depends
    }
  }

}
async function 判断真假_非(非,假设){
  let item=非.item;
  let b;
  let b=await 按类型判断真假(item,假设);
  if(b.value==1){
    return {
      type:"非",
      value:-1,
      reason:b
    }
  }
  else if(b.value==-1){
    return {
      type:"非",
      value:1,
      reason:b
    }
  }
  else if(b.value==0){
    return {
      type:"非",
      value:0,
      reason:b.reason
    }
  }
}
async function 假设推理_info(info,result){
  await 延伸推理_info(info,result,true);
}
async function 假设推理_且(且,result){
  await 延伸推理_且(且,result,true);
}
async function 假设推理_或(或,result){
    await 延伸推理_或(或,result,true);
}
async function 演绎(k,infos){
  let result=[];
  if(k._type=='蕴含'){
    let from=k.from;
    let to=k.to;
    let f_bool_o;
    f_bool_o=await 按类型判断真假(from,infos);

    if(f_bool_o.value==0){

    }
    else if(f_bool_o.value==from.value){
      if(to._type=="env"){
        result.push(to);
        // //最简单直接的情况
        // //env.push(to);
        // await 延伸推理_info(to,result,假设);
      }
      else if(to._type=='tag'){
        for(var h=0;h<to.tag.length;++h){
          result.push({
            _type:'tag',
            info:to.tag[h]
          })
        }
        //result.push(to);
      }
      else if(to.type=='且'){
        await 延伸推理_且(to,result,假设);
      }
      else if(to.type=='或'){
        await 延伸推理_或(to,result,假设);
      }
      else if(to.type=='非'){
        await 延伸推理_非(to,result,假设);
      }
    }
    else{

    }
  }
  return result;
}
async function 延伸推理_info(info,result,假设){
   //获取相关知识
  if(result===undefined){
     result=[];
   }
  if(info.value==0){
     return ;
   }
  let re=false;
  //  for(var i=0;i<监听.length;++i){
  //    if(监听[i].type=='info'&&监听[i].info==info.info){
  //      re=true;
  //      break;
  //    }
  // }
  await newinfo(info,result,假设);
  if(re){
     return ;
   }
  let know=await 获取相关知识_info(info);
  await 演绎(know,result,假设);
  return result;
}
async function 延伸推理_非(非,result,假设){
  await 按类型延伸推理(非.item,非.value*-1,result,假设);
}
async function 按类型延伸推理(item,value,result,假设){
  item.value=value;
  if(item.type=="info"){
    result.push(item);
    await 延伸推理_info(item,result,假设);
  }
  else if(item.type=="或"){
    await 延伸推理_或(item,result,假设);
  }
  else if(item.type=="非"){
    await 延伸推理_非(item,result,假设);
  }
  else if(item.type=='且'){
    await 延伸推理_且(item,result,假设);
  }
}
async function 按类型假设推理(item,value,result){
  item.value=value;
  if(item.type=="info"){
    await 假设推理_info(item,result);
  }
  else if(item.type=="或"){
    await 假设推理_或(item,result);
  }
  else if(item.type=="非"){
    await 假设推理_非(item,result);
  }
  else if(item.type=="且"){
    await 假设推理_且(item,result);
  }
}
function info数组求交集(arr){
  for(var t=0;t<arr[0].length;++t){
    let all=true;
    for(var i=1;i<arr.length;++i){
      let exist=false;
      for(var j=0;j<arr[i].length;++j){
        if(arr[i][j].info==arr[0][t].info){
          exist=true;
          break;
        }
      }
      if(exist){

      }
      else{
        all=false;
        break;
      }
    }
    if(all){}
    else{
      arr[0].splice(t,1);
      --t;
    }
  }
  return arr[0];
}
async function 延伸推理_且(info,result,假设){
  let arr=info.arr;
  if(info.value==1){
    for(var i=0;i<arr.length;++i){
      let item=arr[i];
      await 按类型延伸推理(item,1,result,假设);
    }
  }
  else if(info.value==-1){
    //将( a 且 b 且 c )=-1蕴含 ? 拆分词  a=-1 > ? b=-1=> ? c=-1> ?
    //进行假设推理
    let existflase=false;
    let 假的=[];
    for(var i=0;i<arr.length;++i){
      let item=arr[i];
      let bool;
      bool=await 按类型判断真假(item,假设);
      if(bool.value==-1){
        existflase=true;
        假的=假的.concat(arr.splice(i,1));
        --i;
      }
      else if(bool.value==1){
        arr.splice(i,1);
        --i;
      }
    }
    for(var i=0;i<假的.length;++i){
      按类型延伸推理(假的[i],-1,result,假设);
    }
    if(existflase){}
    else{
      if(arr.length==1){
        await 按类型延伸推理(arr[0],-1,result,假设);
      }
      else{
        let allr=[];
        for(var i=0;i<arr.length;++i){
          let tempr=[];
          await 按类型假设推理(arr[i],-1,tempr);
          allr.push(tempr);
        }
        var 交集=info数组求交集(allr);
        for(var i=0;i<交集.length;++i){
          await newinfo(交集[i],result);
          result.push(交集[i]);
        }
      //  console.log(result);
      }

    }
  }
}
async function 延伸推理_或(或,result,假设){
//  console.log(或);
  let arr=或.arr;
  if(或.value==-1){
    for(var i=0;i<arr.length;++i){
      let item=arr[i];
      await 按类型延伸推理(item,-1,result,假设);
    }
  }
  else if(或.value==1){
    let existtrue=false;
    let 真的=[];
    for(var i=0;i<arr.length;++i){
      let item=arr[i];
      let bool;
      bool=await 按类型判断真假(item,假设);
      if(bool.value==1){
        existtrue=true;
        真的=真的.concat(arr.splice(i,1));
        --i;
      }
      else if(bool.value==-1){
        arr.splice(i,1);
        --i;
      }
    }
    for(var i=0;i<真的.length;++i){
      按类型延伸推理(真的[i],1,result,假设);
    }
  //  console.log(arr);
    if(existtrue){}
    else{
      if(arr.length==1){
        await 按类型延伸推理(arr[0],1,result,假设);
      }
      else{
        let allr=[];
        for(var i=0;i<arr.length;++i){
          let tempr=[];
          await 按类型假设推理(arr[i],1,tempr);
          allr.push(tempr);
        }
        var 交集=info数组求交集(allr);
        for(var i=0;i<交集.length;++i){
          await newinfo(交集[i],result);
          result.push(交集[i]);
        }
      //  console.log(result);
      }

    }
  }
  else{

  }
}
function test1(){
  //最简单情况 A=>B=>C
  延伸推理_info({
    info:"A",
    value:0,
    type:"info"
  }).then(function(){
  //  console.log(env);
    //console.log(knows);
    延伸推理_info({
      info:"A",
      value:1,
      type:"info"
    }).then(function(res){
      console.log(res);
      //console.log(knows);
    })
  })
}
var k_test_info_且=[{
  type:'蕴含',
  from:{
    type:'info',
    info:"k_test_info_且_1",
    value:1
  },
  to:{
    type:'且',
    arr:[{
      type:'info',
      info:'k_test_info_且_2',
    },{
      type:'info',
      info:'k_test_info_且_3',
    }],
    value:1
  }
}];
//全写入(k_test_info_且);
async function test_info_且(){
  var result=[];
  await 延伸推理_info({
    type:'info',
    info:"k_test_info_且_1",
    value:1
  },result);
  console.log(result);
}
//test_info_且();
async function test1(){
  let result=[];
  await 延伸推理_info({
    info:"A",
    value:1,
    type:"info"
  },result);
  console.log(result);
}
function test2(){
  //a1& b1=>c1||c2
  延伸推理_info({
    type:"info",
    info:"a1",
    value:0
  }).then(function(){
    // console.log(env);
    // console.log(knows);
     延伸推理_info({
       type:"info",
       info:"a1",
       value:1
     }).then(function(){
        // console.log(knows);
        // console.log(env);
     })
  })
}
//test1();
//test2();
var test_2_k=[{
  type:"蕴含",
  from:{
    type:"且",
    value:1,
    arr:[
      {
        type:"info",
        info:"a1"
      },
      {
        type:"info",
        info:"b1"
      }
    ]
  },
  to:{
    type:"或",
    value:1,
    arr:[
      {
        type:"info",
        info:"c1"
      },
      {
        type:"info",
        info:"c2"
      }
    ]
  }
}];
// db.全写入(test_2_k);
var konw_test_延伸推理_且_1=[{
  type:'蕴含',
  from:{
    type:'且',
    arr:[
      {
        type:'info',
        info:"test_延伸推理_且_1",
      },
      {
        type:'info',
        info:"test_延伸推理_且_2",
      }
  ],
    value:-1
  },
  to:{
    type:'info',
    info:'test_延伸推理_且_3',
    value:-1
  }
}];
var konw_test_延伸推理_或_1=[{
  type:'蕴含',
  from:{
    type:'或',
    arr:[
      {
        type:'info',
        info:"test_延伸推理_或_1",
      },
      {
        type:'info',
        info:"test_延伸推理_或_2",
      }
  ],
    value:1
  },
  to:{
    type:'info',
    info:'test_延伸推理_或_3',
    value:-1
  }
}];
function  展开知识(k,knows){
  if(k.type=='蕴含'){
    let f=k.from;
    let t=k.to;
    if(f.type=='且'){
      if(f.value==-1){
        let arr=f.arr;
        for(var i=0;i<arr.length;++i){
          let obj={...arr[i]};
          obj.value=-1;
          let nk={
            type:'蕴含',
            from:obj,
            to:t,
          };
          if(obj.type=='且'||obj.type=='或'){
            展开知识(nk,knows);
          }
          else{
            knows.push(nk);
          }

        }
      }
      else{
        knows.push(k);
      }
    }
    else if(f.type=='或'){
      if(f.value==1){
        let arr=f.arr;
        for(var i=0;i<arr.length;++i){
          let obj={...arr[i]};
          obj.value=1;
          let nk={
            type:'蕴含',
            from:obj,
            to:t,
          };
          if(obj.type=='且'||obj.type=='或'){
            展开知识(nk,knows);
          }
          else{
            knows.push(nk);
          }
        }
      }
      else{
        knows.push(k);
      }
    }
    else if(f.type=='info'){
      knows.push(k);
    }
  }
  return k;
}
function 全写入(knows){
  let allk=[];
  for(var i=0;i<knows.length;++i){
    展开知识(knows[i],allk);
  }
  console.log(allk);
  db.全写入(allk);
}
//全写入(konw_test_延伸推理_或_1);
async function  test_延伸推理_且_1(){
  var 结果=[];
  await 延伸推理_且({
    type:'且',
    arr:[
      {
        type:'info',
        info:"test_延伸推理_且_1",
      },
      {
        type:'info',
        info:"test_延伸推理_且_2",
      }
  ],
    value:-1
  },结果);
   console.log(结果);
  // console.log(env);
}
async function  test_延伸推理_或_1(){
  var 结果=[];
  await 延伸推理_或({
    type:'或',
    arr:[
      {
        type:'info',
        info:"test_延伸推理_或_1",
      },
      {
        type:'info',
        info:"test_延伸推理_或_2",
      }
  ],
    value:1
  },结果);
  console.log(结果);
  console.log(env);
}
//test_延伸推理_或_1();
//test_延伸推理_且_1();

async function  test_延伸推理_非(){
  var 结果=[];
  await 延伸推理_非({
    type:'非',
    item:{
      type:'且',
      arr:[{
        type:'info',
        info:'f1'
      },
      {
        type:'info',
        info:'f2'
      }]
    },
    value:-1
  },结果);
  console.log(结果);
}

//test_延伸推理_非();
//aorb and c > dore =1
//已知 d=-1
//e=-1
var 复杂案例1=[
  {
    type:'蕴含',
    from:{
      type:'且',
      arr:[{
        type:'或',
        arr:[{
          type:'info',
          info:'a'
        },{
          type:'info',
          info:'b'
        }]
      },{
        type:'info',
        info:'c'
      }],
      value:1
    },
    to:{
      type:'或',
      arr:[
        {
          type:'info',
          info:'d'
        },{
          type:'info',
          info:'e'
        }
      ],
      value:1
    }
  }
]
//全写入(复杂案例1);
async function 复杂案例1_test(){
  env.push({
    type:'info',
    info:'d',
    value:-1
  });
  env.push({
    type:'info',
    info:'a',
    value:1
  });
  var result=[];
  await 延伸推理_info({
    type:'info',
    info:'c',
    value:1
  },result);
  console.log(result);
  console.log(env);
}
//复杂案例1_test();
var 复杂案例2=[
  {
    type:'蕴含',
    from:{
      type:'且',
      arr:[{
        type:'info',
        info:'复杂案例2_1'
      },{
        type:'info',
        info:'复杂案例2_2'
      }],
      value:-1
    },
    to:{
      type:'且',
      arr:[
        {
          type:'info',
          info:'复杂案例2_3'
        },{
          type:'info',
          info:'复杂案例2_4'
        }
      ],
      value:1
    }
  },
  {
    type:'蕴含',
    from:{
      info:'复杂案例2_5',
      type:'info',
      value:-1
    },
    to:{
      type:'且',
      arr:[
        {
          type:'info',
          info:'复杂案例2_3'
        },{
          type:'info',
          info:'复杂案例2_4'
        }
      ],
      value:1
    }
  }
]
//全写入(复杂案例2);

async function 复杂案例2_test(){
  var result=[];
  await 假设推理_且({
    type:'且',
    value:-1,
    arr:[
      {
        type:'且',
        arr:[{
          type:'info',
          info:'复杂案例2_1'
        },{
          type:'info',
          info:'复杂案例2_2'
        }],
      },
      {
        info:'复杂案例2_5',
        type:'info',
      }
    ]
  },result);
  console.log(result);
//  console.log(env);
}

//复杂案例2_test();

exports.演绎=演绎;







//





















//
