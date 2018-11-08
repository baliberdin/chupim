var builder = require('./lib/builder');
var pipelines = require('./lib/pipelines.js');
var stages = require('./lib/stages.js');

module.exports = {
  pipelines: pipelines,
  builder: builder,
  stages: stages,

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

  registerStage: function(prefix, name, fn){
    stages.register(prefix,name,fn);
  },

  registerComponent: function(config){
    let fn = builder.component(config);
    let elements = {};
    let component = {id:config.id, name:config.name, fn:fn, elements:elements};
    this.components[config.id] = component;
    return this.components[config.id];
  },

  getPipelineComponent: function(id){
    return this.components[id];
  },

  removePipelineComponent: function(id){
    delete this.components[id];
  }
};