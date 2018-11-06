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
			query:{},
			response: {},
			_chupim_: {
        query: {},
        metadata:{
          stages_info:[], 
          stage:0
        }
      }
		};
		return context;
	},

  registerPipelineComponent: function(name, path, stages, elements){
    var component = {name:name, fn:builder.component({stages:stages}), elements:elements, path:path};
    this.components[path] = component;
  },

  registerComponent: function(config){
    let fn = builder.component(config);
    let elements = {};
    let component = {name:config.name, fn:fn, elements:elements, path:config.path};
    this.components[config.path] = component;
  },

  getPipelineComponent: function(path){
    return this.components[path];
  },

  removePipelineComponent: function(path){
    delete this.components[path];
  }
};