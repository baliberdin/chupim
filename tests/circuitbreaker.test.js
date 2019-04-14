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

const test = require('tape')
const chupim = require('../');

// Registering stages for test
const package = "testCircuitBreaker";
chupim.registerStage({
  prefix: package,
  name: 'stage1', 
  fn: async (c) => {
    return c;
  }
});

chupim.registerStage({
  prefix: package,
  name: 'fallback', 
  fn: async (c) => {
    c.fallback = 'ok';
    return c;
  }
});

chupim.registerStage({
  prefix: package,
  name: 'stage2', 
  fn: async (context) => { 
    return await new Promise( (resolve, reject) => {
      setTimeout(() => {
        resolve(context);
      }, 250); 
    })
  },
  circuitbreaker: {
    enabled: true,
    timeout: 200,
    action: 0
  }
});

chupim.registerStage({
  prefix: package,
  name: 'stage3', 
  fn: async (context) => { 
    return await new Promise( (resolve, reject) => {
      setTimeout(() => {
        resolve(context);
      }, 250); 
    })
  },
  circuitbreaker: {
    enabled: true,
    timeout: 200,
    action: 1,
    fn: `${package}.fallback`
  }  
});

test('Should break a stage if it spent more than 200 milliseconds', (t) => {
  let context = chupim.createContext();
  let pipeline = chupim.registerComponent({
    id: 'circuit-breaker-test1',
    name:'CircuitBreakerTest1',
    stages:[`${package}.stage1`,`${package}.stage2`]
  });

  pipeline.fn(context).then(r => {
    t.assert(r == undefined, 'Has pipeline result');
    t.fail('Pipeline does not throw exception');
    t.end();
  }).catch(e => {
    t.assert(e != undefined, 'Has an error message');
    t.end();
  });
});

test('Should fallback a stage if it spent more than 200 milliseconds', (t) => {
  let context = chupim.createContext();
  let pipeline = chupim.registerComponent({
    id: 'circuit-breaker-test2',
    name:'CircuitBreakerTest2',
    stages:[`${package}.stage1`,`${package}.stage3`]
  });

  pipeline.fn(context).then(r => {
    t.assert(r != undefined, 'Has pipeline result');
    t.assert(r.fallback == 'ok', 'Result has a fallback information');
    t.end();
  }).catch(e => {
    t.fail('Has an error message');
    t.end();
  });
});