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



import type { ComponentConfig, GraphEdge, GraphElements, GraphNode, StageList } from './types';

interface RichStage {
  id: string;
  label: string;
}

// Same shape of StageList, but each stage name is replaced by a RichStage
type RichStageList = Array<RichStage | RichStageList[]>;
type GraphPoint = { id: string };

const graph = {
  parseElements: function(config: ComponentConfig): GraphElements {
    let elements: GraphElements = {nodes:[], edges:[]};
    
    let input: GraphNode = {
      data:{id:'Input', label:'Input', type:'source'},
    };

    let output: GraphNode = {
      data:{id:'Output', label:'Output', type:'sink'},
    };

    elements.nodes.push(input);
    elements.nodes.push(output);

    let richStages = this.fromConfigToRichStages(config.stages);
    elements.nodes.push( ...this.stageConfigToNodeList(richStages) );
    elements.edges.push( ...this.stageConfigToEdgeList(richStages, [], input.data, output.data) );

    return elements;
  },

  stageConfigToEdgeList: function(stages: RichStageList, edgeList: GraphEdge[] | undefined, lastStage: GraphPoint | GraphPoint[], finalStage?: GraphPoint): GraphEdge[] {
    if(edgeList == undefined) edgeList = [];

    if(stages.constructor == Array){
      for(var i=0; i<stages.length; i++){
        
        let stage = stages[i];
        if(Array.isArray(stage)){
          
          let newLastStage: GraphPoint[] = [];
          for(var j=0; j< stage.length; j++){
            this.stageConfigToEdgeList(stage[j], edgeList, lastStage);
            newLastStage.push(stage[j][stage[j].length-1] as RichStage);
          }
          
          lastStage = newLastStage;
        }else {
          if(Array.isArray(lastStage)){
            for(let k=0;k<lastStage.length; k++){
              edgeList.push(this.stageToEdge(lastStage[k], stage));
            }
          }else{
            edgeList.push(this.stageToEdge(lastStage, stage));
          }
          lastStage = stage;
        }
      }
    }

    if(finalStage != undefined){
      if(Array.isArray(lastStage)){
        for(let k=0;k<lastStage.length; k++){
          edgeList.push(this.stageToEdge(lastStage[k], finalStage));
        }
      }else{
        edgeList.push(this.stageToEdge(lastStage, finalStage));
      }
    }
    return edgeList;
  },

  stageConfigToNodeList: function(stages: RichStageList | RichStageList[], stageList?: GraphNode[]): GraphNode[] {
    if(stageList == undefined) stageList = [];

    if(stages.constructor == Array){
      for(var i=0; i<stages.length; i++){
        let stage = stages[i];
        if(Array.isArray(stage)){
          this.stageConfigToNodeList(stage, stageList);
        }else{
          stageList.push(this.stageToNode(stage));
        }
      }
    }

    return stageList;
  },

  stageToNode: function(stage: RichStage): GraphNode {
    let type = stage.label.split(".")[0];
    let label = stage.label.split(".")[1];

    let node = {
      data:{id:stage.id, label:label, type:type, configName: stage.label},
    };

    return node;
  },

  stageToEdge: function(lastStage: GraphPoint, stage: GraphPoint): GraphEdge {
    let edge = {
      data:{
        source:lastStage.id,
        target: stage.id
      }
    };

    return edge;
  },

  fromConfigToRichStages: function(stages: StageList, id?: number): RichStageList {
    if(id == undefined)id=0;
    let richStages: any[] = [];
    let pid = 0;
    let arr = 0;
    Object.assign(richStages, stages);

    for(var i=0; i<richStages.length; i++){
      if(richStages[i].constructor == Array){
        arr++;
        richStages[i] = this.fromConfigToRichStages(richStages[i], id+arr);
      }else{
        richStages[i] = {id:`${id}.${++pid}`, label:richStages[i]};
      }
    }
    
    return richStages;
  }

}

export default graph;
