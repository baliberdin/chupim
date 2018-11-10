module.exports = {
  parseElements: function(config){
    let elements = {nodes:[], edges:[]};
    
    let input = {
      data:{id:'Input', label:'Input', type:'source'},
    };

    let output = {
      data:{id:'Output', label:'Output', type:'sink'},
    };

    elements.nodes.push(input);
    elements.nodes.push(output);

    let richStages = this.fromConfigToRichStages(config.stages);
    elements.nodes.push( ...this.stageConfigToNodeList(richStages) );
    elements.edges.push( ...this.stageConfigToEdgeList(richStages, [], input.data, output.data) );

    return elements;
  },

  stageConfigToEdgeList: function(stages, edgeList, lastStage, finalStage){
    if(edgeList == undefined) edgeList = [];

    if(stages.constructor == Array){
      for(var i=0; i<stages.length; i++){
        
        let stage = stages[i];
        if(stage.constructor == Array){
          
          let newLastStage = [];
          for(var j=0; j< stage.length; j++){
            this.stageConfigToEdgeList(stage[j], edgeList, lastStage);
            newLastStage.push(stage[j][stage[j].length-1]);
          }
          
          lastStage = newLastStage;
        }else {
          if(lastStage.constructor == Array){
            for(let k=0;k<lastStage.length; k++){
              edgeList.push(this.stageToEdge(lastStage[k], stage));
            }
          }else{
            edgeList.push(this.stageToEdge(lastStage, stage));
          }
          lastStage = stages[i];
        }
      }
    }

    if(finalStage != undefined){
      if(lastStage.constructor == Array){
        for(let k=0;k<lastStage.length; k++){
          edgeList.push(this.stageToEdge(lastStage[k], finalStage));
        }
      }else{
        edgeList.push(this.stageToEdge(lastStage, finalStage));
      }
    }
    return edgeList;
  },

  stageConfigToNodeList: function(stages, stageList){
    if(stageList == undefined) stageList = [];

    if(stages.constructor == Array){
      for(var i=0; i<stages.length; i++){
        let stage = stages[i];
        if(stage.constructor == Array){
          this.stageConfigToNodeList(stage, stageList);
        }else{
          stageList.push(this.stageToNode(stage));
        }
      }
    }

    return stageList;
  },

  stageToNode: function(stage){
    let type = stage.label.split(".")[0];
    let label = stage.label.split(".")[1];

    let node = {
      data:{id:stage.id, label:label, type:type, configName: stage.label},
    };

    return node;
  },

  stageToEdge: function(lastStage, stage){
    let edge = {
      data:{
        source:lastStage.id,
        target: stage.id
      }
    };

    return edge;
  },

  fromConfigToRichStages: function(stages, id){
    if(id == undefined)id=0;
    let richStages = [];
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