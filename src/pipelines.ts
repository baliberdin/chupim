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


import metrics from './metrics';
import errors from './errors';
import type { Context, JoinFunction, PipelineFunction, Stage, StageInfo } from './types';

const stageWrapper = async (context: Context, stage: Stage | PipelineFunction): Promise<any> => {
	if(stage.name == undefined || stage.name == null || stage.name.trim() == ""){
		// this is a anonymous function
		return await (stage as PipelineFunction)(context);
	}

	const s = stage as Stage;

	if(context == undefined || context.constructor !== Object){
		console.log(`[INFO] Stage [${s.name}] skiped.`);
		return undefined;
	}

	var startTime = new Date();
	var elapsedTime: number;
	var result;

	try {
		result = await s.fn(context);
	}catch(e){
		elapsedTime = new Date().getTime() - startTime.getTime();
		metrics.addHit(s.key(), elapsedTime,2);
		errors.addStageError(s,e);
		throw e
	}

	elapsedTime = new Date().getTime() - startTime.getTime();
	metrics.addMetric(s.key(), elapsedTime);
  
	var stageMetadata: StageInfo = {
		name:s.name, 
		prefix:s.prefix, 
		elapsedTime: elapsedTime, 
		execution_indx:context._chupim_.metadata.executed_stages++
	};

	context._chupim_.metadata.stages_info.push(stageMetadata);
	
	return result;
};

const pipeline = {
	serialPipeline: async (context: any, ...stages: Stage[]): Promise<any> => {
		// Happens when no configured stage name was found on the container
		if(stages.length == 0){
			return context;
		}

		if(stages.length == 1){
			return stageWrapper(context,stages[0]);
		}

    var fn: PipelineFunction = (stages as Array<Stage | PipelineFunction>)
      .reduce( (f1,f2) => {
        if(f1.constructor.name == 'Object'){
          return async (q: any) => stageWrapper(q,f1)
            .then(r => stageWrapper(r,f2));	
        }else{
          return async (q: any) => (f1 as PipelineFunction)(q)
            .then(r => stageWrapper(r,f2));
        }
      }) as PipelineFunction;
      
		return fn(context);
	},

	parallelPipeline: async (context: any, joinFunction: JoinFunction, ...pipelines: PipelineFunction[]): Promise<any> => {
		if(pipelines.length == 0){
			return joinFunction(context);
		}else{
			// Results keep the declared order of pipelines, not the completion order
			let results = await Promise.all(pipelines.map( pipeline => pipeline(context) ));
			return joinFunction(results);
		}
	}
}

export default pipeline;
