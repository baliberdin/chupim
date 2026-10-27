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
import type { Context, FallbackFunction, StageFunction } from './types';

const circuitbreaker = {

  timedFunction: function(serviceName: string, fn: StageFunction, timeout?: number): StageFunction {
    return async context => {
      return new Promise((resolve, reject) => {
        var timeLimit = timeout || 1000;
        let settled = false;

        const timer = setTimeout(
          () => {
            settled = true;
            metrics.addCircuitBreak(serviceName);
            reject(new Error(`Timeout on: ${serviceName}.`))
          },
          timeLimit
        );
        fn(context)
          .then(r => {
            if(!settled){
              settled = true;
              clearTimeout(timer);
              resolve(r);
            }
          })
          .catch(e => {
            if(!settled){
              settled = true;
              clearTimeout(timer);
              reject(e);
            }
          });
      });
    };
  },

  timedFallback: function(serviceName: string, fn: StageFunction, fallbackFunction: FallbackFunction, timeout?: number): StageFunction {
    return async context => {
      return new Promise((resolve, reject) => {
        var timeLimit = timeout || 1000;
        let settled = false;

        const timer = setTimeout(
          () => {
            settled = true;
            metrics.addCircuitBreak(serviceName);
            reject(new Error(`[Circuit Breaker] Exceeded time limit (${timeLimit}): ${serviceName}.`));
          },
          timeLimit
        );

        fn(Object.create(context) as Context)
          .then(r => {
            if(!settled){
              settled = true;
              clearTimeout(timer);
              resolve(Object.assign(context,r));
            }
          })
          .catch(e => {
            if(!settled){
              settled = true;
              clearTimeout(timer);
              reject(e);
            }
          });
      }).catch( e => {
        errors.addError(serviceName, e);
        return fallbackFunction(context, e);
      });
    };
  },
};

export default circuitbreaker;
