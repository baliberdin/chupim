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


const circuitbreaker = require('./circuitbreaker');
const stage = {

	container: {},
	
	getStageFunction: function(sName){
    let type = sName.substring(0,sName.indexOf("."));
    let stageName = sName.substring(sName.indexOf(".")+1,sName.length);
    if(this.container[type]){
      return this.container[type][stageName].fn;
    }
    
    return;
  },

	register: function(stage) {
		if(stage == undefined || stage == null || stage.constructor !== Object) throw new Error('Invalid stage object.');
		if(stage.prefix == undefined || stage.name == undefined) throw new Error('Invalid prefix or stage name.');

		if(this.container[stage.prefix] == undefined){
			this.container[stage.prefix] = {};
		}

		if(stage.fn != undefined && stage.fn.constructor != undefined && stage.fn.constructor.name == 'AsyncFunction'){
			stage.source = stage.fn.toString();

			if(stage.circuitbreaker && stage.circuitbreaker.enabled == true){
				let serviceName = `${stage.prefix}.${stage.name}`;
				stage.circuitbreaker.timeout = stage.circuitbreaker.timeout || 1000;

				if(stage.circuitbreaker.action == 0){
					stage.fn = circuitbreaker.timedFunction(serviceName,stage.fn, stage.circuitbreaker.timeout);

				}else if(stage.circuitbreaker.action == 1){
					let fallbackFunction = this.getStageFunction(stage.circuitbreaker.fn);

					if(stage.circuitbreaker.fn && fallbackFunction != undefined && fallbackFunction.constructor.name == 'AsyncFunction'){
						stage.fn = circuitbreaker.timedFallback(serviceName,stage.fn, fallbackFunction, stage.circuitbreaker.timeout);
					}else{
						throw new TypeError(`Invalid Fallback Function: [${stage.circuitbreaker.fn}]`);
					}
					
				}else{
					throw new TypeError(`Circuitbreaker action unknown: [${stage.circuitbreaker.action}]`);
				}
			}
			
			stage.key = () =>  stage.prefix+"."+stage.name;
			this.container[stage.prefix][stage.name] = stage;
			return stage;
		}else{
			throw new Error('Invalid Stage. Stages must be Async Function.');
		}
	},

	join: {
		defaultJoin: (values) => {
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
		}
	}
}

module.exports = stage;
