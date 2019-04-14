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


const metrics = require('./metrics');
const errors = require('./errors');

const stageWrapper = async (context, stage) => {
	if(stage.name == undefined || stage.name == null || stage.name.trim() == ""){
		// this is a anonymous function
		return await stage(context);
	}

	if(context == undefined || context.constructor !== Object){
		console.log(`[INFO] Stage [${stage.name}] skiped.`);
		return undefined;
	}

	var elapsedTime = new Date();
	var result;
	var error;

	try {
		//let c = Object.create(context);
		result = await stage.fn(context);
	}catch(e){
		error = e.toString();
		result = context;
		elapsedTime = new Date() - elapsedTime;
		metrics.addHit(stage.key(), elapsedTime,2);
		errors.addStageError(stage,e);
		throw e
	}

	elapsedTime = new Date() - elapsedTime;
	metrics.addMetric(stage.key(), elapsedTime);
  
	if(context._chupim_.metadata.stages_info[stage.name] == undefined){
		var stageMetadata = {
      name:stage.name, 
      prefix:stage.prefix, 
      elapsedTime: elapsedTime, 
      execution_indx:context._chupim_.metadata.executed_stages++
    };

		if(error != undefined){
			stageMetadata.error = error;
		}

		context._chupim_.metadata.stages_info.push(stageMetadata);
	}
	
	return result;
};

const pipeline = {
	serialPipeline: async (context, ...stages) => {
		var i=0;
		if(stages.length == 1){
			return stageWrapper(context,stages[0]);
		}

    var fn = stages.length == 0? context: stages
      .reduce( (f1,f2) => {
        if(f1.constructor.name == 'Object'){
          return async (q) => stageWrapper(q,f1)
            .then(r => stageWrapper(r,f2));	
        }else{
          return async (q) => f1(q)
            .then(r => stageWrapper(r,f2));
        }
      });
      
		return fn(context);
	},

	parallelPipeline: async (context, joinFunction, ...pipelines) => {
		if(pipelines.length == 0){
			return joinFunction(context);
		}else{
			let results = [];
			let pipelinesPromises = pipelines.map( pipeline => {
				return pipeline(context).then( result => results.push(result) );
			});	

			await Promise.all(pipelinesPromises);
			return joinFunction(results);
		}
	}
}

module.exports = pipeline;