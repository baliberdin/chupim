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


import builder from './builder';
import pipelines from './pipelines';
import stages from './stages';
import graph from './graph';
import metrics from './metrics';
import errors from './errors';
import type { Component, ComponentConfig, Context, Stage, StageDefinition } from './types';

export type * from './types';

export { pipelines, builder, stages, graph, metrics, errors };

// Kept as an array (like the original API), but used as a map indexed by component id.
export const components = [] as unknown as Record<string, Component>;

export function createContext(): Context {
  var context: Context = {
    _chupim_: {
      params: {debug:false},
      metadata:{
      stages_info:[], 
        executed_stages:0
      }
    }
  };
  return context;
}

export function registerStage(stage: StageDefinition): Stage {
  return stages.register(stage);
}

export function registerComponent(config: ComponentConfig): Component {
  let fn = builder.component(config);
  let elements = graph.parseElements(config);
  let component: Component = {id:config.id, name:config.name, fn:fn, elements:elements, methods:config.methods||[], enabled:config.enabled||false};
  components[config.id] = component;
  return components[config.id];
}

export function getPipelineComponent(id: string): Component | undefined {
  return components[id];
}

export function removePipelineComponent(id: string): void {
  delete components[id];
}

export function getStageByPackage(prefix: string, stageName: string): Stage | undefined {
  if(stages.container[prefix]){
    return stages.container[prefix][stageName];
  }
  
  return;
}
