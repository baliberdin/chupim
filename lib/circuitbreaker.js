const metrics = require('./metrics');
const errors = require('./errors');
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


module.exports = {

  timedFunction: function(serviceName, fn, timeout){
    return async context => {
      return new Promise((resolve, reject) => {
        var timeLimit = timeout || 1000;
        let rejected = false;
        let resolved = false;

        setTimeout(
          () => {
            if(!resolved){
              rejected = true;
              metrics.addCircuitBreak(serviceName);
              reject(new Error(`Timeout on: ${serviceName}.`))
            }
          },
          timeLimit
        );
        fn(context)
          .then(r => {
            if(!rejected){
              resolved = true;
              resolve(r);
            }
          })
          .catch(e => reject(e));
      });
    };
  },

  timedFallback: function(serviceName, fn, fallbackFunction, timeout){
    return async context => {
      return new Promise((resolve, reject) => {
        var timeLimit = timeout || 1000;
        let rejected = false;
        let resolved = false;

        setTimeout(
          () => {
            if(!resolved){
              rejected = true;
              metrics.addCircuitBreak(serviceName);
              reject(new Error(`[Circuit Breaker] Exceeded time limie(${timeLimit}): ${serviceName}.`));
            }
          },
          timeLimit
        );

        fn(Object.create(context))
          .then(r => {
            if(!rejected){
              resolved = true;
              resolve(Object.assign(context,r));
            }
          })
          .catch(e => reject(e));
      }).catch( e => {
        errors.addError(serviceName, e);
        return fallbackFunction(context, e);
      });
    };
  },
};