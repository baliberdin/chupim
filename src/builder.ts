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



import pipeline from './pipelines';
import stages from './stages';
import metrics from './metrics';
import type { ComponentConfig, Context, GroupPipelineObject, PipelineFunction, PipelineObject, Stage, StageList } from './types';

const builder = {

    getStagesByName: function(stageNamesList?: string[]): Stage[] {
        var stageList: Stage[] = [];

        if(stageNamesList != undefined && stageNamesList.constructor === Array){
            stageNamesList.map(s => {
                var type = s.substring(0,s.indexOf("."));
                var stageName = s.substring(s.indexOf(".")+1,s.length);

                if(stages.container[type] != undefined && stages.container[type][stageName] != undefined){
                    stageList.push(stages.container[type][stageName]);
                }
            });
        }

        return stageList;
    },

    isASingleSerialPipeline: function(list: unknown): boolean {
        if(Array.isArray(list)){
            var result = true;
            list.forEach( i => {
                if(i.constructor == Array)result = false;
            });
            return result;
        }else{
            return false;
        }
    },

    isAMixedPipeline: function(list: unknown): boolean {
      var result = false;
      var type;
      if(Array.isArray(list)){
          for(var i=0; i<list.length; i++){
            var stage = list[i];

            if(type == undefined){
              type = stage.constructor;
              continue;
            }else{
              if(stage.constructor != type){
                result = true;
              }
            }
          }
          return result;
      }else{
          return false;
      }
    },

    createSimpleSerialPipeline: function(stages: string[]): PipelineFunction {
        return (c) => pipeline
            .serialPipeline(c, ...this.getStagesByName(stages));
    },

    createMixedPipeline: function(stages: StageList): GroupPipelineObject {
      return {type:"group", pipelines:this.extractInlinePipelines(stages)};
    },

    extractInlinePipelines: function(stages?: StageList, pipelines?: PipelineObject[]): PipelineObject[] {
      if(pipelines == undefined) pipelines = [];
      if(stages == undefined || stages.constructor != Array)return pipelines;
      
      var splicedStages: string[] = [];
        for(var i=0; i<stages.length; i++){
          var s = stages[i];

          if(!Array.isArray(s)){
            splicedStages.push(s);
          }else{
            if(splicedStages.length > 0){
              var serialPipeline = this.createSimpleSerialPipeline(splicedStages);
              pipelines.push({type:"serial",pipeline:serialPipeline, names:splicedStages});
              splicedStages = [];
            }
            
            var parallelPipelines: PipelineObject[] = [];
            for(var j=0; j<s.length; j++){
              var a = s[j];
              parallelPipelines.push(...this.stageConfigToPipelineObjects(a,[]));
            }

            pipelines.push({type:"parallel",pipelines:parallelPipelines});
          }
        }

        if(splicedStages.length > 0){
          var serialPipeline = this.createSimpleSerialPipeline(splicedStages);
          pipelines.push({type:"serial",pipeline:serialPipeline, names:splicedStages});
          splicedStages = [];
        }

        return pipelines;
    },

    stageConfigToPipelineObjects: function(stages?: StageList, pipelines?: PipelineObject[]): PipelineObject[] {
      if(pipelines == undefined) pipelines = [];
      if(stages == undefined || stages.constructor != Array)return pipelines;

      if(this.isAMixedPipeline(stages)){
        var pipelineGroup = this.createMixedPipeline(stages);
        pipelines.push(pipelineGroup);
      }else{
        return this.extractInlinePipelines(stages);
      }

      return pipelines;
    },

    pipelineObjectsToComponent: function(pipelineObjects: PipelineObject[]): PipelineFunction {
      var fn: PipelineFunction = async (c) => c;
      pipelineObjects.forEach( p => {
        var faux = fn;

        if(p.type == 'serial'){
          fn = async (c) => p.pipeline(await faux(c));
        }else if(p.type == 'parallel'){
          var pipelines = p.pipelines.map( pp => {
            if(pp.type == 'group'){
              return this.pipelineObjectsToComponent(pp.pipelines);
            }else{
              return (pp as any).pipeline as PipelineFunction;
            }
          });
          
          fn = async (c) => pipeline.parallelPipeline( await faux(c), stages.join.defaultJoin, ...pipelines);
        }else if(p.type == 'group'){
          fn = this.pipelineObjectsToComponent(p.pipelines);
        }
      });

      return fn;
    },

    component: function(config: ComponentConfig): (context: Context) => Promise<any> {
        var pipelineObjects = this.stageConfigToPipelineObjects(config.stages);
        var fn = this.pipelineObjectsToComponent(pipelineObjects);
        return async (context) => {

          var startTime = new Date();
          let pipelineResult = await fn(context);

          let totalTime = new Date().getTime() - startTime.getTime();
          pipelineResult._chupim_.metadata.totalTime = totalTime;

          if(pipelineResult._chupim_.params.debug.constructor == Boolean && !pipelineResult._chupim_.params.debug){
            delete pipelineResult._chupim_;
          }
          
          metrics.addMetric(config.id, totalTime);
          return pipelineResult;
        };
    }
}

export default builder;
