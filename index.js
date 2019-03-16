var builder = require('./lib/builder');
var pipelines = require('./lib/pipelines.js');
var stages = require('./lib/stages.js');
var graph = require('./lib/graph.js');
var metrics = require('./lib/metrics');
//var circuitbreaker = require('./lib/circuitbreaker');

module.exports = {
  pipelines: pipelines,
  builder: builder,
  stages: stages,
  graph: graph,
  metrics: metrics,
  //circuitbreaker: circuitbreaker,

  components: [],

  createContext: function(){
    var context = {
      _chupim_: {
        params: {debug:false},
        metadata:{
        stages_info:[], 
          executed_stages:0
        }
      }
    };
    return context;
  },

  registerStage: function(stage){
    this.stages.register(stage);
  },

  registerComponent: function(config){
    let fn = builder.component(config);
    let elements = graph.parseElements(config);
    let component = {id:config.id, name:config.name, fn:fn, elements:elements, methods:config.methods||[], enabled:config.enabled||false};
    this.components[config.id] = component;
    return this.components[config.id];
  },

  getPipelineComponent: function(id){
    return this.components[id];
  },

  removePipelineComponent: function(id){
    delete this.components[id];
  },

  getStage: function(sName){
    let type = sName.substring(0,sName.indexOf("."));
    let stageName = sName.substring(sName.indexOf(".")+1,sName.length);
    if(stages.container[type]){
      return stages.container[type][stageName];
    }
    
    return;
  }
};