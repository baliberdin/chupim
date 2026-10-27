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


import circuitbreaker from './circuitbreaker';
import type { JoinFunction, Stage, StageDefinition, StageFunction } from './types';

const stage = {

	container: {} as Record<string, Record<string, Stage>>,
	
	getStageFunction: function(sName: string): StageFunction | undefined {
    let type = sName.substring(0,sName.indexOf("."));
    let stageName = sName.substring(sName.indexOf(".")+1,sName.length);
    return this.container[type]?.[stageName]?.fn;
  },

	register: function(stage: StageDefinition): Stage {
		if(stage == undefined || stage == null || stage.constructor !== Object) throw new Error('Invalid stage object.');
		if(stage.prefix == undefined || stage.name == undefined) throw new Error('Invalid prefix or stage name.');

		if(this.container[stage.prefix] == undefined){
			this.container[stage.prefix] = {};
		}

		if(stage.fn != undefined && stage.fn.constructor != undefined && stage.fn.constructor.name == 'AsyncFunction'){
			const registered = stage as Stage;
			registered.source = stage.fn.toString();

			if(stage.circuitbreaker && stage.circuitbreaker.enabled == true){
				let serviceName = `${stage.prefix}.${stage.name}`;
				stage.circuitbreaker.timeout = stage.circuitbreaker.timeout || 1000;

				if(stage.circuitbreaker.action == 0){
					stage.fn = circuitbreaker.timedFunction(serviceName,stage.fn, stage.circuitbreaker.timeout);

				}else if(stage.circuitbreaker.action == 1){
					let fallbackFunction = stage.circuitbreaker.fn ? this.getStageFunction(stage.circuitbreaker.fn) : undefined;

					if(stage.circuitbreaker.fn && fallbackFunction != undefined && fallbackFunction.constructor.name == 'AsyncFunction'){
						stage.fn = circuitbreaker.timedFallback(serviceName,stage.fn, fallbackFunction, stage.circuitbreaker.timeout);
					}else{
						throw new TypeError(`Invalid Fallback Function: [${stage.circuitbreaker.fn}]`);
					}
					
				}else{
					throw new TypeError(`Circuitbreaker action unknown: [${stage.circuitbreaker.action}]`);
				}
			}
			
			registered.key = () =>  stage.prefix+"."+stage.name;
			this.container[stage.prefix][stage.name] = registered;
			return registered;
		}else{
			throw new Error('Invalid Stage. Stages must be Async Function.');
		}
	},

	join: {
		defaultJoin: ((values) => {
			var results = values.filter( v => {
				if(v){
					return v;
				}
			});

			if(results.length > 0){
				var result = results.reduce( (a,b) => {
					return Object.assign(a,b);
				});
	
				return result;
			}

			return;
		}) as JoinFunction
	}
}

export default stage;
