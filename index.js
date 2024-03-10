/*
   Copyright 2019 Allan Mendes Silva Baliberdin

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
   
*/

var builder = require('./lib/builder');
var pipelines = require('./lib/pipelines.js');
var stages = require('./lib/stages.js');
var graph = require('./lib/graph.js');
var metrics = require('./lib/metrics');
var errors = require('./lib/errors');

module.exports = {
  pipelines: pipelines,
  builder: builder,
  stages: stages,
  graph: graph,
  metrics: metrics,
  errors: errors,

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
    return this.stages.register(stage);
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

  getStageByPackage: function(prefix, stageName){
    if(stages.container[prefix]){
      return stages.container[prefix][stageName];
    }
    
    return;
  }
};