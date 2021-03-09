//原来根本没有所谓的智能
//定义物体的属性 行为 以及事件和行为如何影响物体的属性
//map 一组信息的集合 在不同的地点会得到不同的信息 视力决定能获得多远的信息
//我错了 错在断了源头 竟陷入这般困境
// 所有的行为 可定义为 获取新的信息 这包含对已有信息的修改
var events = require('events');
var arangojs=require('arangojs');
const { spawn } = require('child_process');
var Logic=require('./逻辑推理.js');
var Database =arangojs.Database;
var aql=arangojs.aql;
var db = new Database('http://127.0.0.1:8529');
db.useBasicAuth("root","104521");
db.useDatabase("truth");
var locationMap=db.graph("location");

var emitter_info = new events.EventEmitter();
//emitter_info.emit('someEvent', 'arg1 参数', 'arg2 参数');
async function init(){
  //建立初始map
}
async function 新建地图(地图){
  var map=地图.map;
  var 规则=地图.规则;
  var location=db.collection("location");
  var _地图=await db.collection("map").save(地图);
  for(var i=0;i<map.length;++i){
    map[i]._map=_地图._id;
    let _location=await location.save(map[i]);
    map[i]._location=_location._id;
  }
  for(var i=0;i<map.length;++i){
    let item=map[i];
    let info=item.info;
    let _action=item._action;
    for(var t=0;t<_action.length;++t){
      let _state=_action[t]._state;
      let exp=await byExample("location",{
        _state:_state,
        _map:item._map
      });
      await db.collection("location_location").save({
        _from:item._location,
        _to:exp._id
      });
    }
    for(var t=0;t<info.length;++t){
      if(info[t]._type=='env'){

        let _e_o={
          _type:'env',
          info:info[t].info,
          _map:_地图._id
        }
        let _e_r=await byExample("env",_e_o);
        if(!_e_r){
          _e_r=await db.collection("env").save(_e_o);
        }
        await db.collection("location_env").save({
          _from:item._location,
          _to:_e_r._id
        })
      }
      // else if(info[t]._type=='tag'){
      //
      //   let _e_o={
      //     _type:'tag',
      //     info:info[t].info,
      //     _map:_地图._id
      //   }
      //   let _e_r=await byExample("tag",_e_o);
      //   if(!_e_r){
      //     _e_r=await db.collection("tag").save(_e_o);
      //   }
      //   await db.collection("location_tag").save({
      //     _from:item._location,
      //     _to:_e_r._id
      //   })
      // }
      else if(info[t]._type=='something'){
        let tag=info[t].tag;
        delete info[t].tag;
        let something=await db.collection("something").save(info[t])
        for(var x=0;x<tag.length;++x){
          let _e_o={
            _type:'tag',
            info:tag[x],
            _map:_地图._id
          }
          let _e_r=await byExample("tag",_e_o);
          if(!_e_r){
            _e_r=await db.collection("tag").save(_e_o);
          }
          await db.collection("something_tag").save({
             _from:something._id,
             _to:_e_r._id
           });
        }
        await db.collection("location_something").save({
          _from:item._location,
          _to:something._id
        })
      }

    }
  }
  if(规则){
    await pushMap(_地图._id);
    await 新增规则(规则);
    await popMap();
  }
  return _地图;
}
var map=[
  {
    _state:{
      x:1,
      y:1,
    },
    _action:[
      {
        _state:{
          x:2,
          y:1
        },
        _cost:0
      },
      {
        _state:{
          x:1,
          y:2
        },
        _cost:0
      },
    ],
    info:[]
  },
  {
    _state:{
      x:1,
      y:2,
    },
    info:[
      {
        _type:'env',
        info:'微风',

      }
    ],
    _action:[
      {
        _state:{
          x:1,
          y:3
        },
        _cost:0
      },
      {
        _state:{
          x:2,
          y:2
        },
        _cost:0
      },
      {
        _state:{
          x:1,
          y:1
        },
        _cost:0
      },
    ],
  },
  {
    _state:{
      x:1,
      y:3,
    },
    _action:[
      {
        _state:{
          x:1,
          y:2
        },
        _cost:0
      },
      {
        _state:{
          x:2,
          y:3
        },
        _cost:0
      },
    ],
    info:[]
  },
  {
    _state:{
      x:2,
      y:1,
    },
    _action:[
      {
        _state:{
          x:2,
          y:2
        },
        _cost:0
      },
      {
        _state:{
          x:3,
          y:1
        },
        _cost:0
      },
      {
        _state:{
          x:1,
          y:1
        },
        _cost:0
      },
    ],
    info:[]
  },
  {
    _state:{
      x:2,
      y:2,
    },
    info:[
      {
        _type:'env',
        info:'臭气',

      }
    ],
    _action:[
      {
        _state:{
          x:1,
          y:2
        },
        _cost:0
      },
      {
        _state:{
          x:3,
          y:2
        },
        _cost:0
      },
      {
        _state:{
          x:2,
          y:3
        },
        _cost:0
      },
      {
        _state:{
          x:2,
          y:1
        },
        _cost:0
      },
    ],
  },
  {
    _state:{
      x:2,
      y:3,
    },
    _action:[
      {
        _state:{
          x:3,
          y:3
        },
        _cost:0
      },
      {
        _state:{
          x:1,
          y:3
        },
        _cost:0
      },
      {
        _state:{
          x:2,
          y:2
        },
        _cost:0
      },
    ],
    info:[]
  },
  {
    _state:{
      x:3,
      y:1,
    },
    _action:[
      {
        _state:{
          x:3,
          y:2
        },
        _cost:0
      },
      {
        _state:{
          x:2,
          y:1
        },
        _cost:0
      },
    ],
    info:[]
  },
  {
    _state:{
      x:3,
      y:2,
    },
    info:[
      {
        _type:'env',
        info:'金光',
      }
    ],
    _action:[
      {
        _state:{
          x:2,
          y:2
        },
        _cost:0
      },
      {
        _state:{
          x:3,
          y:1
        },
        _cost:0
      },
      {
        _state:{
          x:3,
          y:3
        },
        _cost:0
      },
    ],
  },
  {
    _state:{
      x:3,
      y:3,
    },
    _action:[
      {
        _state:{
          x:2,
          y:3
        },
        _cost:0
      },
      {
        _state:{
          x:3,
          y:2,
        },
        _cost:0
      },
    ],
    info:[]
  },
]
var 规则=[
  {
    _type:'蕴含',
    from:{
      _type:'env',
      info:'臭气',
      value:1
    },
    to:{
      _type:'tag',
      tag:['怪兽'],
      value:1
    }
  },
  {
    _type:'蕴含',
    from:{
      _type:'env',
      info:'微风',
      value:1
    },
    to:{
      _type:'tag',
      tag:['无底洞'],
      value:1
    }
  },
  {
    _type:'蕴含',
    from:{
      _type:'env',
      info:'金光',
      value:1
    },
    to:{
      _type:'tag',
      tag:['黄金'],
      value:1
    }
  }
]
// var 地图={
//   map:map,
//   规则:规则,
//   _state:{
//     x:1,
//     y:1
//   },
//   _see:2
// }
async function 建立关联(from,item,type){
  let currentmap=await getCurrentMap();
  item._map=currentmap._id;
  if(item._type=='蕴含'){
    let f=item.from;
    let to=item.to;
    let k=await db.collection("knowledge").save(item);
    await 建立关联(k,f,'前因');
    await 建立关联(k,to,'后果');
  }
  else if(item._type=='env'){
    let env=await byExample("env",{
      _type:item._type,
      info:item.info,
      _map:item._map
    });
    if(!env){
      env=await db.collection("env").save({
        _type:"env",
        info:item.info,
        _map:item._map
      })
    }
    await db.collection("env_know").save({
      _type:type,
      _from:from._id,
      _to:env._id
    });
  }
  else if(item._type=='tag'){
    var tag=item.tag;
    for(var i=0;i<tag.length;++i){
      let _t=await byExample("tag",{
        _type:item._type,
        info:tag[i],
        _map:item._map
      });
      if(!_t){
        _t=await db.collection("tag").save({
          _type:"tag",
          info:tag[i],
          _map:item._map
        })
      }
      await db.collection("tag_know").save({
        _type:type,
        _from:from._id,
        _to:_t._id
      });
    }
  }
  else if(item._type=='且'){
    let arr=item.arr;
    for(var i=0;i<arr.length;++i){
      await 建立关联(from,arr[i],type);
    }
  }
  else if(item._type=='或'){
    let arr=item.arr;
    for(var i=0;i<arr.length;++i){
      await 建立关联(from,arr[i],type);
    }
  }
}
async function 新增规则(knows){
  for(var i=0;i<knows.length;++i){
    console.log(knows[i]);
    await 建立关联(null,knows[i]);
  }
}
async function byExample(collection,exp,all){
  let _e_cursor=await db.collection(collection).byExample(exp);
  let _e_r=await _e_cursor.all();
  if(_e_r.length==0){
    return null;
  }
  else if(all){
    return _e_r;
  }
  else{
    return _e_r[0];
  }
}
async function query(aql){
  let _e_cursor=await db.query(aql);
  let _e_r=await _e_cursor.all();
  return _e_r;
}
async function addTarget(tar){
  //用其不完备
  /*
    {
     _type:'env',
     major:env/123,
     _weight:80,
     score:0,
     _goal:80,
     ignore:true
  }
  {
    _type:'location',
    id:location/123,
    _weight:80,
    score:0,
  }
  {
    _type:"tag",
    major:tag/123,
    _weight:80,
    score:0,
    minor:[
    {
    tag:111
    _weight:20
  }
  {
  _type:'thing',
  id:'something/123'
}
  ]

  }
  */
  tar._state='active';
  tar._time=new Date().getTime();
  // var t={
  //   _weight:tar._weight,
  //   _type:'active',
  //   _time:new Date().getTime(),
  //   _map:tar._map,
  //   _goal:tar._goal,
  //   score:tar.score
  // };
  // var t_r=await db.collection("target").save(t);
  // var tags=tar.tags;
  // var envs=tar.envs;
  // var somethings=tar.somethings;
  // for(var i=0;i<tags.length;++i){
  //   await db.collection("target_tag").save({
  //     _from:t_r._id,
  //     _to:tags[i]._id,
  //     _weight:tags[i]._weight
  //   })
  // }
  // for(var i=0;i<envs.length;++i){
  //   await db.collection("target_env").save({
  //     _from:t_r._id,
  //     _to:envs[i]._id,
  //     _weight:envs[i]._weight
  //   })
  // }
  // //此处最复杂 未完
  // for(var i=0;i<somethings.length;++i){
  //   await db.collection("target_something").save({
  //     _from:t_r._id,
  //     _to:somethings[i]._id,
  //     _weight:envs[i]._weight
  //   })
  // }
  // return t_r
  return db.collection("target").save(tar);
}
async function getCurrentMap(){
  let map_s=await byExample("stack",{
    _type:"map",
  });
   let top=map_s.stack[map_s.stack.length-1];
   return db.collection("map").document(top);
}
async function pushMap(id){
  let map_s=await byExample("stack",{
    _type:"map",
  });
  map_s.stack.push(id);
  db.collection("stack").update(map_s._id,{
    stack:map_s.stack
  })
}
async function popMap(all){
  let map_s=await byExample("stack",{
    _type:"map",
  });
  if(all){
    map_s.stack=['map/base'];
  }
  else{
    if(map_s.length==1){
      map_s.stack=['map/base'];
    }
    else{
      map_s.stack.splice(map_s.stack.length-1,1);
    }
  }
  await db.collection("stack").update(map_s._id,{
    stack:map_s.stack
  })
}
async function getKnowledge(info){
  var _map=await getCurrentMap();
  if(info._type=='env'){
    let env=await byExample("env",{
      info:info.info,
      _map:_map._id
    });
    let knows=await query(
      `
        for x in env_know
        filter x._to=='${env._id}'
         for y in knowledge
         filter y._id==x._from
         return distinct y
      `);
    return knows;

  }
}
async function 闭包演绎(infos){
  //console.log(infos);
  //获取相关知识
  var _map=await getCurrentMap();
  var _knows=[];
  var memory=await db.collection("memory").save({
    _type:'演绎'
  });
  //console.log(infos);
  //console.log(infos);
  for(var i=0;i<infos.length;++i){
    let info=infos[i];
    if(info._type=='env'){
      let knows=await getKnowledge(info);
      for(var t=0;t<knows.length;++t){
        let exp={
          _type:"knowledge",
          _batch:memory._id,
          _knowledge:knows[t]._id,
        };
        _q=await byExample("memory",exp);

        if(!_q){
          exp._state='active';
          _q=await db.collection("memory").save(exp,{
            returnNew:true
          });
          _q=_q.new;
          _knows.push(knows[t]);
        }
        if(_q._state=='active'){
          var res=await Logic.演绎(knows[t],infos);
          if(res.length==0){

          }
          else{
            for(var l=0;l<res.length;++l){
              infos.push(res[l]);
            }
            db.collection("memory").update(_q._id,{
              _state:'fullfill'
            })
            //console.log(res);
          }

        }
      }

    }
  }
  return infos;
}
async function abstract(){
  /*
  剔除不相关 本质上是抽象归类的应用 根据某个抽象类 剔除掉不属于该类的物件
  如何抽象
  1. 可作为某种行动的 施者或受者
  2. 拥有一组相同的 tag
  */
}
async function getSeeLocInfo(see,curloc){
  var map=await getCurrentMap();
  if(!curloc){
    curloc=await getCurLocInfo();
  }
  var see=see?see:map._see;
  var res=await locationMap.traversal(curloc._id,{
    maxDepth:see,
    direction: "outbound",
    minDepth:1,
    uniqueness:{
      vertices:"path",
      edges:"path"
    }
  });
  var path=res.visited.paths;
  return path;
}
async function getCurLocInfo(_state){
  var map=await getCurrentMap();
  if(_state){
    let location=await byExample("location",{
      _state:_state,
      _map:map._id
    });
    return location;
  }
  if(map._state){

    var exp={...map._state};
    let location=await byExample("location",{
      _state:exp,
      _map:map._id
    });
    return location;
  }
  else{
    return null;
  }
}
async function getInfo(_state){
  //多种信息获取方式
  //非当前map的 info 过滤掉
  var infos=[];
  var location=await getCurLocInfo(_state);
  if(location){
    infos=infos.concat(location.info);
  }

  await 闭包演绎(infos);
  return infos;
}
async function expand(path){
  var result=[];
  let vertices=path.vertices;
  let edges=path.edges;
  var exp=await getSeeLocInfo(1,{_id:edges[edges.length-1]._to});
  for(var i=0;i<exp.length;++i){
    let _to=exp[i].edges[0]._to;
    let back=false;
    for(var t=0;t<edges.length;++t){
      if(edges[t]._from==_to||edges[t]._to==_to){
        back=true;
        break;
      }
    }
    if(!back){
      let t={
        edges:edges.slice(0),
        vertices:vertices.slice(0)
      };
      t.edges.push(exp[i].edges[0]);
      t.vertices.push(exp[i].vertices[1]);
      result.push(t);
    }
  }
  return result;
}
async function 调整路径优先级(tar,paths){
  let target_envs=tar.target_envs;
  let target_tag=tar.target_tag;
  let target_trace_l=await byExample("target_trace",{
    _from:tar._id
  });
  let _traces_l=[];
  if(target_trace_l){
    _traces_l=await query(`
        for x in trace_actions
        filter x._from=='${target_trace_l._to}'
         for y in actions
         filter y._id==x._to
         return y.to
      `);
  }
  function _sort(a,b){
    if(a.step<b.step){
      return -1
    }
    else{
      return 1
    }
  }
  for(var i=0;i<target_envs.length;++i){
    let trace=[];
    let _env=target_envs[i].result;
    let _w=target_envs[i].edge._weight;
    let _ls=await query(`
        for x in location_env
        filter x._to=='${_env._id}'
        limit 3
        return x
      `);
    for(var t=0;t<_ls.length;++t){
      let _l=_ls[t];
      let _acs=await query(`
          for x in actions
          filter x._type=="location"&& x.to=='${_l._from}'
          sort x.visited desc
          limit 3
          return x
        `);
      for(var h=0;h<_acs.length;++h){
        let _ac=_acs[h];
        let _trace_actions=await query(`
              for x in trace_actions
              filter x._to=='${_ac._id}'
              return distinct x
          `);
        for(var u=0;u<_trace_actions.length;++u){
          let _trace=_trace_actions[u]._from;
          let _as=await query(`
              for x in trace_actions
              filter x._from=='${_trace}' && x.step<${_trace_actions[u].step}
               for y in actions
               filter y._id==x._to &&y._type=='location'
               return {
                 step:'${_trace_actions[u].step}'-x.step,
                 loc:y.from
               }
            `);
          trace=trace.concat(_as);
        }
      }
    }
    trace.sort(_sort);
    target_envs[i].trace=trace;
  }
  for(var i=0;i<target_tag.length;++i){
    let trace=[];
    let _tag=target_tag[i].result;
    let _w=target_tag[i].edge._weight;
    let _ls=await query(`
        for x in location_tag
        filter x._to=='${_tag._id}'
        limit 3
        return x
      `);
    for(var t=0;t<_ls.length;++t){
      let _l=_ls[t];
      let _acs=await query(`
          for x in actions
          filter x._type=="location"&& x.to=='${_l._from}'
          sort x.visited desc
          limit 3
          return x
        `);
      for(var h=0;h<_acs.length;++h){
        let _ac=_acs[h];
        let _trace_actions=await query(`
              for x in trace_actions
              filter x._to=='${_ac._id}'
              return distinct x
          `);
        for(var u=0;u<_trace_actions.length;++u){
          let _trace=_trace_actions[u]._from;
          let _as=await query(`
              for x in trace_actions
              filter x._from=='${_trace}' && x.step<${_trace_actions[u].step}
               for y in actions
               filter y._id==x._to &&y._type=='location'
               return {
                 step:'${_trace_actions[u].step}'-x.step,
                 loc:y.from
               }
            `);
          trace=trace.concat(_as);
        }
      }
    }
    trace.sort(_sort);
    target_tag[i].trace=trace;
  }
  for(var i=0;i<paths.length;++i){
    if(paths[i]._weight){
      continue;
    }
    let w=0;
    var edges=paths[i].edges;
    var vertices=paths[i].vertices;
    var last=vertices[vertices.length-1];
    for(var t=1;t<vertices.length;++t){
      let infos=vertices[t].info;
      vertices[t].info=await 闭包演绎(infos);
      let weight=await calWeight(tar,vertices[t].info);
      w+=weight;
    }
    for(var t=0;t<target_envs.length;++t){
      let trace=target_envs[t].trace;
      let _env=target_envs[t].result;
      let _w=target_envs[t].edge._weight;
      let index=null;
      for(var h=0;h<trace.length;++h){
        if(trace[h].loc==last._id){
          w+=_w/10/trace[h].step;
          break;
        }
      }
    }
    for(var t=0;t<target_tag.length;++t){
      let trace=target_tag[t].trace;
      let _tag=target_tag[t].result;
      let _w=target_tag[t].edge._weight;
      let index=null;
      for(var h=0;h<trace.length;++h){
        if(trace[h].loc==last._id){
          w+=_w/10/trace[h].step;
          break;
        }
      }
    }
    paths[i]._weight=w;
  }
  for(var i=0;i<paths.length;++i){
    let edge_t=paths[i].edges[paths[i].edges.length-1]._to;
    let c=0;
    for(var t=0;t<_traces_l.length;++t){
      if(_traces_l[t]==edge_t){
        ++c;
      }
    }
    paths[i]._weight-=c*10;
    for(var p=1;p<paths[i].edges.length-1;++p){
      for(var t=0;t<_traces_l.length;++t){
        if(_traces_l[t]==paths[i].edges[p]._to){
          paths[i]._weight-=3;
          break;
        }
      }
    }
  }
  paths.sort(function(a,b){
    if(a._weight>b._weight){
      return -1;
    }
    else{
      if(a.vertices.length<b.vertices.length){
        return -1
      }
      else{
        return 1
      }
    }
  })
}
async function getLikeTar(tar){
  //主要矛盾 次要矛盾
  let target_envs=tar.target_envs;
  let target_tag=tar.target_tag;
  function s(a,b){
    if(a.edge._weight>b.edge._weight){
      return -1
    }
    else{
      return 1
    }
  }
  if(tar._goal>0){
    target_envs.sort(s);
    target_tag.sort(s);
    let mainenv=[];
    let maintag=[];
    for(var i=0;i<target_envs.length;++i){
      let f=target_envs[i];
      let s=target_envs[i+1];
      mainenv.push(f);
      if(!s){
        break;
      }
      if(f.edge._weight>0&&s.edge._weight<0){
        break;
      }
      if(f.edge._weight/s.edge._weight>1.5){
        break;
      }
    }
  }
  else if(tar._goal==0){

  }

  let tars=await query(`
      for x in target
      filter x._type=="active"&&x._map=='${tar._map}'
      sort x._time DESC
      return x
    `);

}
async function cut(tar,path){
  // if(path._weight<=-100){
  //   return true;
  // }
  // let edge=path.edges[path.edges.length-1];
  // let e=await byExample("memory",{
  //   _type:'action',
  //   action:{
  //     _type:'location',
  //     edge:{
  //       _from:edge._from,
  //       _to:edge._to
  //     }
  //   },
  //   _target:tar._id,
  //   _map:tar._map,
  // });
  // if(e){
  //   return true;
  // }
  return false;
}
async function scaleDownNode(id,level){
  // if(loc.indexOf(id)==-1){
  //   return null;
  // }
  let result=await locationMap.traversal(id,{
    maxDepth:level,
    direction: "outbound",
    uniqueness:{
      vertices:"global",
      edges:"global"
    },
    init: "result.vertices = [];",
    visitor: "result.vertices.push(vertex._id);",
  });
  // for(var i=0;i<result.length;++i){
  //   let index=loc.indexOf(result[i]);
  //   if(index==-1){
  //     result.splice(i,1);
  //     --i;
  //     continue;
  //   }
  //   else{
  //     loc.splice(index,1);
  //   }
  // }
  // return {
  //   result,
  //   loc
  // }
  return result.vertices;
}
async function scaleDownNext(id,loc){
  var result=await locationMap.traversal(loc[i],{
    maxDepth:3,
    minDepth:3,
    direction: "outbound",
    uniqueness:{
      vertices:"global",
      edges:"global"
    },
    init: "result.vertices = [];",
    visitor: "result.vertices.push(vertex._id);",
  });
  //筛选掉已被打包的节点
  for(var i=0;i<result.length;++i){
    let index=loc.indexOf(result[i]);
    if(index==-1){
      //已被打包
      result.splice(i,1);
      --i;
      continue;
    }
  }
  return result;
}
async function alreadyScale(node,level){
  let r=await query(`
      for x in scale_location
      filter x._to=='${node}'&&x._type=='interior'
        for y  in scale
        filter y._id==x._from&&y._level==${level}
        limit 1
        return y
    `);
  if(r.length==0){
    return null;
  }
  else{
    return r[0];
  }
}
async function getBundary(node,level){
  let result=await locationMap.traversal(node,{
    maxDepth:level+1,
    minDepth:level+1,
    direction: "outbound",
    uniqueness:{
      vertices:"global",
      edges:"global"
    },
    init: "result.vertices = [];",
    visitor: "result.vertices.push(vertex._id);",
  });
  return result.vertices;
}
async function scaleDown(level){
  let loc=await query(`
      for x in location
      filter x._map=='map/1650310'
      return x._id
    `);
  for(var i=0;i<loc.length;++i){
    let node=loc[i];
    let scaled=await alreadyScale(node,level);
    let res;
    if(scaled){
      res=scaled;
    }
    else{
      let batch=await scaleDownNode(node,level);
      let batched=[];
      for(var t=0;t<batch.length;++t){
        let bool=await alreadyScale(batch[t],level);
        if(bool){
          batched.push(batch[t]);
          batch.splice(t,1);
          --t;
        }
      }
      res=await db.collection("scale").save({
        _level:level
      });
      for(var t=0;t<batch.length;++t){
        await db.collection("scale_location").save({
          _from:res._id,
          _to:batch[t],
          _type:'interior',
          _level:level
        })
      }
      let bundary=await getBundary(node,level);
      for(var t=0;t<bundary.length;++t){
        if(batch.indexOf(bundary[t])!=-1){
          bundary.splice(t,1);
          --t;
        }
      }
      for(var t=0;t<bundary.length;++t){
        let bool=await alreadyScale(bundary[t],level);
        if(bool){
          let exist=await byExample("scale_scale",{
            _from:res._id,
            _to:bool._id
          });
          if(exist){
            continue;
          }
          else{
            await db.collection("scale_scale").save({
              _from:res._id,
              _to:bool._id
            })
          }

        }
        else{
          await db.collection("scale_location").save({
            _from:res._id,
            _to:bundary[t],
            _type:'bundary',
            _level:level
          })
        }

      }

    }
    let oth=await query(`
      for x in scale_location
      filter x._to=='${node}'&&x._type=='bundary'
        for y  in scale
        filter y._id==x._from&&y._level==${level}
        return y
      `);
    for(var t=0;t<oth.length;++t){
      await db.collection("scale_scale").save({
        _from:oth[t]._id,
        _to:res._id
      })
    }
    await db.collection("scale_location").removeByExample({
      _to:node,
      _type:'bundary',
      _level:level
    });
  }
}
//scaleDown(2);
async function getAction(tar,infos){
  //有一点没想到 a>c b>c 如果我不打算 先走到b 在到c 且 b离a 有很远 那么 b>c的经验
  //对我又有什么用的 如何剪掉这一点 能剪掉吗 原来如此是我用反了 应该正着用而不是倒着用
  // 在当前可见范围内 查出 是否有到过目标的经验 而不是 查出目标相关的所有经验 看是否在
  //可见范围呢
  //过人之处
  //三种行为 方式 1.map 组间切换 2. 经验  组内切换 3 预期  需先认识 time
  // if(tar._type=='location'){
  //
  // }
  // else if(tar._type=='env'){
  //
  // }
  // else if(tar._type=='tag'){
  //
  // }
  // else if(tar._type=='something'){
  //
  // }
  var action=[];
  var paths=[];
  let count=1;
  var newpath=[];
  paths=await getSeeLocInfo(1);
  await 调整路径优先级(tar,paths);
  while (count<5) {
    for(var i=0;i<paths.length;++i){
      let c=await cut(tar,paths[i]);
      if(c){
        paths.splice(i,1);
        --i;
      }
    }
    if(paths.length>5){
      paths=paths.slice(0,5);
    }
    for(var i=0;i<paths.length;++i){
      if(!paths[i].expanded){
        let expanded=await expand (paths[i]);
        newpath=newpath.concat(expanded);
      }
      paths[i].expanded=true;
    }
    paths=newpath.concat(paths);
    newpath=[];
    ++count;
    await 调整路径优先级(tar,paths);
  }

  if(paths.length==0){
    return null;
  }
  //console.log(path);
  return {
    _type:'location',
    from:paths[0].edges[0]._from,
    to:paths[0].edges[0]._to
  }
}
async function calWeight(tar,infos){
  let target_envs=tar.target_envs;
  let target_tag=tar.target_tag;
  // let target_something=await query(
  //   `
  //   for x in target_something
  //   filter x._from=='${tar._id}'
  //   return x
  //   `
  // )
  let weight=0;
  for(var i=0;i<target_envs.length;++i){
    let _env=target_envs[i].result;
    for(var t=0;t<infos.length;++t){
      if(infos[t]._type=='env'&&infos[t].info==_env.info){
        weight+=target_envs[i].edge._weight;
      }
    }
  }
  for(var i=0;i<target_tag.length;++i){
    let _tag=target_tag[i].result;
    for(var t=0;t<infos.length;++t){
      if(infos[t]._type=='tag'&&infos[t].info==_tag.info){
        weight+=target_tag[i].edge._weight;
      }
    }
  }
  return weight;
}
async function finishTar(tar){
  console.log('目标达成');
  await db.collection("target").update(tar._id,{
    _type:"finish"
  });
  return ;
}
async function act(tar,action){
  if(action._type=='location'){
    let loc=await db.collection("location").document(action.to);
    console.log(loc);
    _state=loc._state;
    await db.collection("map").update(tar._map,{
      _state:_state
    })
  }
}
async function testTar(tar,loc){
  let infos=loc.info;
  if(tar._type=='location'){
    if(loc._id==tar.id){
      return true;
    }
  }
  else if(tar._type=='env'){
    let major=tar.major;
    // let env=await db.collection("env").document(major);
    for(var i=0;i<infos.length;++i){
      if(infos[i]._type=='env'&&infos[i]._id==major){
        return true;
      }
    }
  }
  else if(tar._type=='tag'){
    let major=tar.major;
    //let tag=await db.collection("tag").document(major);
    for(var i=0;i<infos.length;++i){
      if(infos[i]._type=="something"){
        let r=await query(`
            for x in something_tag
            filter x._from=='${infos[i]._id}'&& x._to=='${major}'
            return x
          `);
        if(r.length>0){
          return true;
        }
      }
    }
  }
  else if(tar._type=='something'){
    for(var i=0;i<infos.length;++i){
      if(infos[i]._type=='something'&&infos[i]._id==tar.id){
        return true;
      }
    }
  }
  return false;
}
async function thought(tar){
  await pushMap(tar._map);
  // if(tar._type=='location'){
  //
  // }
  // else if(tar._type=='env'){
  //
  // }
  // else if(tar._type=='tag'){
  //
  // }
  // else if(tar._type=='something'){
  //
  // }
  // let target_envs=await query(
  //   `
  //   for x in target_env
  //   filter x._from=='${tar._id}'
  //    for y in env
  //    filter y._id==x._to
  //    return {
  //      edge:x,
  //      result:y
  //    }
  //   `
  // )
  // let target_tag=await query(
  //   `
  //   for x in target_tag
  //   filter x._from=='${tar._id}'
  //   for y in tag
  //   filter y._id==x._to
  //   return {
  //     edge:x,
  //     result:y
  //   }
  //   `
  // )
  // let target_something=await query(
  //   `
  //   for x in target_something
  //   filter x._from=='${tar._id}'
  //   for y in something
  //   filter y._id==x._to
  //   return {
  //     edge:x,
  //     result:y
  //   }
  //   `
  // )
  // tar.target_envs=target_envs;
  // tar.target_tag=target_tag;
  // tar.target_something=target_something;
  var loc=await getCurLocInfo();

  let infos=await 闭包演绎(loc.info);
  loc.info=infos;
  // var weight=await calWeight(tar,infos);
  // tar.score+=weight;
  // if(tar.score>=tar._goal){
  //
  //   await finishTar(tar);
  //   return ;
  // }
  let suc=await testTar(tar,loc);
  if(suc){
    await finishTar(tar);
    return ;
  }
  let action=await getAction(tar,infos);
  if(!action){
    await db.collection("target").update(tar._id,{
      _weight:tar._id-20,
      _type:'fail'
    });
    console.log('行动失败');
    return
  }
  console.log(action);
  if(action._type=='location'){
    var target_trace= await byExample("target_trace",{
      _from:tar._id
    });

    let m=await byExample("actions",{
      _type:"location",//表明结果是切换location
      "from":action.from,
      "to":action.to,
    });
    if(m){
      await db.collection("actions").update(m._id,{
        visited:m.visited+1
      })
    }
    else{
      m=await db.collection("actions").save({
        _type:"location",//表明结果是切换location
        "from":action.from,
        "to":action.to,
        visited:1
      })
    }
    if(target_trace){
      let _c=await  query(`
            for x in trace_actions
            filter x._from=='${target_trace._to}'
            return x
          `)

      await db.collection("trace_actions").save({
        _from:target_trace._to,
        _to:m._id,
        step:_c.length+1
      })
    }
    else{
      let _trace=await db.collection("trace").save({
        _type:"trace",
        time:new Date().getTime()
      })
      target_trace=await db.collection("target_trace").save({
        _from:tar._id,
        _to:_trace._id
      })
      await db.collection("trace_actions").save({
        _from:_trace._id,
        _to:m._id,
        step:1
      })
    }
    await act(tar,action);
  }
}
async function 修正(){

}
async function deside(){}
async function updateTars(info){

}
async function move(){
  var tars=await query(
    `
    for x in target
    filter x._type=='active'
    SORT x._weight DESC
    SORT x._time DESC
    limit 10
    return x
    `
  );

  for(var i=0;i<tars.length;++i){

    await thought(tars[i]);


  }
}
async function changePos(position){
  position._time=new Date().getTime();
  position._type='current';
  let now=await byExample("trace",{
    _type:'current'
  });
  if(now){
    await db.collection("trace").update(now._key,{
      _type:'before'
    })
  }
  db.collection("trace").save(position);
}
async function start(position){
  // if(position){
  //   await changePos(position);
  // }
  while(true){
    await move();
  }
}
async function newSomething(something){
  //2种 类型 对应有主动行为能力 和只有被动行为能力
  //通用的主动行为能力
  //1  建立关联  和取消关联
  //通用的被动行为能力
  //1 通过时间流逝  建立或取消关联
  // 行动的条件
  //1 拥有或不拥有某些关联 对物件的数量要求 对环境的要求
  // 行动的代价
  //1 新增或取消某些关联 对物件数量的增减 对环境的改变
  //暂未定义内在状态 比如情绪
  /*
  施者 受者
    {
      _type:"action",
      presume:{
      _type:'tag',
      id:tag/111,
      kind:'with'|unwith
      who:'施者'||受者
    }
    presume:{
    _type:'relation',
    id:tag/111,
    kind:'with'|unwith,
    from:'id'|施者|受者
    to:'id'|施者|受者
  },
  presume:{
  _type:'something',
  id:something/111,
  kind:'equal'|great|less,
  number:3
  who:'施者'||受者
}
  result:{
  _type:'tag',
  id:tag/111,
  kind:'with'|unwith
  who:'施者'||受者
}
result:{
_type:'tag',
id:tag/111,
kind:'with'|unwith
who:'施者'||受者
}
result:{
_type:'relation',
id:tag/111,
kind:'with'|unwith,
from:'id'|施者|受者
to:'id'|施者|受者
}
result:{
_type:'something',
id:something/111,
kind:'increase'|decrease,
number:3
who:'施者'||受者
}
定义了内在状态后还有其他
    }
  */
  /*
  生命周期客观存在 体现在  在特定时间之后 会对 关联 数量 等进行修改
  对未来的预期 通过对过去数量的变化 预期未来也会有相同的变化
   同时预期 未来的收入 和 支出 计算净值 如果 增加 则 很好
   如果减少 则 存在危机  同时还可主观的减少或增加收入或支出
   关联类似 广义的支出或收入

  */
  //所以 必然存在增加或减少某种数量的target
  return db.collection("something").save(something);
}
// newSomething({
//   _level:2//'生物'
// })
// emitter_info.on('info', function(info) {
//     updateTars();
//     move();
// });
//move();
//先建立 我的概念
// target
//_type location location_id something_id something env tag
/*
{
_type:"location",

}
*/
// addTarget({
//   tags:[
//     {
//     _id:'tag/1622097',
//     _weight:100
//   },
//   {
//     _id:'tag/1622081',
//     _weight:-100
//   },
//   {
//     _id:'tag/1622065',
//     _weight:-100
//   }
// ],
//   envs:[],
//   somethings:[],
//   _map:"map/1621950",
//   _weight:60,
//   _goal:100,
//   score:0
// }).then(function(res){
//   console.log(res);
// })
// 新建地图(地图).then(function(res){
//   console.log(res);
// })

var map=[
  {
    _state:{
      x:1,
      y:1,
    },
    _action:[
      {
        _state:{
          x:2,
          y:1
        },
        _cost:0
      },
      {
        _state:{
          x:1,
          y:2
        },
        _cost:0
      },
    ],
    info:[]
  },
  {
    _state:{
      x:1,
      y:2,
    },
    info:[ ],
    _action:[
      {
        _state:{
          x:1,
          y:3
        },
        _cost:0
      },
      {
        _state:{
          x:2,
          y:2
        },
        _cost:0
      },
      {
        _state:{
          x:1,
          y:1
        },
        _cost:0
      },
    ],
  },
  {
    _state:{
      x:1,
      y:3,
    },
    _action:[
      {
        _state:{
          x:1,
          y:2
        },
        _cost:0
      },
      {
        _state:{
          x:2,
          y:3
        },
        _cost:0
      },
      {
        _state:{
          x:1,
          y:4
        },
        _cost:0
      },
    ],
    info:[]
  },
  {
    _state:{
      x:1,
      y:4,
    },
    _action:[
      {
        _state:{
          x:1,
          y:3
        },
        _cost:0
      },
      {
        _state:{
          x:2,
          y:4
        },
        _cost:0
      },
    ],
    info:[]
  },
  {
    _state:{
      x:2,
      y:1,
    },
    _action:[
      {
        _state:{
          x:2,
          y:2
        },
        _cost:0
      },
      {
        _state:{
          x:3,
          y:1
        },
        _cost:0
      },
      {
        _state:{
          x:1,
          y:1
        },
        _cost:0
      },
    ],
    info:[]
  },
  {
    _state:{
      x:2,
      y:2,
    },
    info:[],
    _action:[
      {
        _state:{
          x:1,
          y:2
        },
        _cost:0
      },
      {
        _state:{
          x:3,
          y:2
        },
        _cost:0
      },
      {
        _state:{
          x:2,
          y:3
        },
        _cost:0
      },
      {
        _state:{
          x:2,
          y:1
        },
        _cost:0
      },
    ],
  },
  {
    _state:{
      x:2,
      y:3,
    },
    _action:[
      {
        _state:{
          x:3,
          y:3
        },
        _cost:0
      },
      {
        _state:{
          x:1,
          y:3
        },
        _cost:0
      },
      {
        _state:{
          x:2,
          y:2
        },
        _cost:0
      },
      {
        _state:{
          x:2,
          y:4
        },
        _cost:0
      },
    ],
    info:[]
  },
  {
    _state:{
      x:2,
      y:4,
    },
    _action:[
      {
        _state:{
          x:3,
          y:4
        },
        _cost:0
      },
      {
        _state:{
          x:2,
          y:3
        },
        _cost:0
      },
      {
        _state:{
          x:1,
          y:4
        },
        _cost:0
      },
    ],
    info:[]
  },
  {
    _state:{
      x:3,
      y:1,
    },
    _action:[
      {
        _state:{
          x:3,
          y:2
        },
        _cost:0
      },
      {
        _state:{
          x:2,
          y:1
        },
        _cost:0
      },
      {
        _state:{
          x:4,
          y:1
        },
        _cost:0
      },
    ],
    info:[]
  },
  {
    _state:{
      x:3,
      y:2,
    },
    info:[],
    _action:[
      {
        _state:{
          x:2,
          y:2
        },
        _cost:0
      },
      {
        _state:{
          x:3,
          y:1
        },
        _cost:0
      },
      {
        _state:{
          x:3,
          y:3
        },
        _cost:0
      },
      {
        _state:{
          x:4,
          y:2
        },
        _cost:0
      },
    ],
  },
  {
    _state:{
      x:3,
      y:3,
    },
    _action:[
      {
        _state:{
          x:2,
          y:3
        },
        _cost:0
      },
      {
        _state:{
          x:3,
          y:2,
        },
        _cost:0
      },
      {
        _state:{
          x:4,
          y:3,
        },
        _cost:0
      },
      {
        _state:{
          x:3,
          y:4,
        },
        _cost:0
      },
    ],
    info:[]
  },
  {
    _state:{
      x:3,
      y:4,
    },
    _action:[
      {
        _state:{
          x:4,
          y:4
        },
        _cost:0
      },
      {
        _state:{
          x:3,
          y:3
        },
        _cost:0
      },
      {
        _state:{
          x:2,
          y:4
        },
        _cost:0
      },
    ],
    info:[]
  },
  {
    _state:{
      x:4,
      y:1,
    },
    _action:[
      {
        _state:{
          x:4,
          y:2
        },
        _cost:0
      },
      {
        _state:{
          x:3,
          y:1
        },
        _cost:0
      },
    ],
    info:[]
  },
  {
    _state:{
      x:4,
      y:2,
    },
    info:[],
    _action:[
      {
        _state:{
          x:3,
          y:2
        },
        _cost:0
      },
      {
        _state:{
          x:4,
          y:1
        },
        _cost:0
      },
      {
        _state:{
          x:4,
          y:3
        },
        _cost:0
      },
    ],
  },
  {
    _state:{
      x:4,
      y:3,
    },
    _action:[
      {
        _state:{
          x:3,
          y:3
        },
        _cost:0
      },
      {
        _state:{
          x:4,
          y:2,
        },
        _cost:0
      },
      {
        _state:{
          x:4,
          y:4,
        },
        _cost:0
      },
    ],
    info:[
      {
        _type:"something",
        tag:['gold'],
        _level:1,
        _count:5
      }
    ]
  },
  {
    _state:{
      x:4,
      y:4,
    },
    _action:[
      {
        _state:{
          x:3,
          y:4
        },
        _cost:0
      },
      {
        _state:{
          x:4,
          y:3
        },
        _cost:0
      },
    ],
    info:[]
  },
]
// var 规则=[]
// var 地图={
//   map:map,
//   规则:规则,
//   _state:{
//     x:1,
//     y:1
//   },
//   _see:2
// }
//
// 新建地图(地图).then(function(res){
//   console.log(res);
// })
//
// addTarget({
//   tags:[
//     {
//     _id:'tag/1650483',
//     _weight:100
//   }
// ],
//   envs:[],
//   somethings:[],
//   _map:"map/1650310",
//   _weight:60,
//   _goal:100,
//   score:0
// }).then(function(res){
//   console.log(res);
// })


//var workerProcess=spawn('arangosh', ["--server.username","root","--server.password","104521"],{stdio:["pipe","inherit","inherit"]});
// workerProcess.stdout.on('data', function (data) {
//      console.log('stdout: ' + data);
//   });
//
// //   workerProcess.stderr.on('data', function (data) {
// //      console.log('stderr: ' + data);
// //   });
// //
// //   workerProcess.on('close', function (code) {
// //      console.log('子进程已退出，退出码 '+code);
// //   });
//
//













//
