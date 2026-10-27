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


import { test, expect } from 'vitest';
import * as chupim from '../src';

// Registering stages for test
const pkg = "testCircuitBreaker";
chupim.registerStage({
  prefix: pkg,
  name: 'stage1', 
  fn: async (c) => {
    return c;
  }
});

chupim.registerStage({
  prefix: pkg,
  name: 'fallback', 
  fn: async (c) => {
    c.fallback = 'ok';
    return c;
  }
});

chupim.registerStage({
  prefix: pkg,
  name: 'stage2', 
  fn: async (context) => { 
    return await new Promise( (resolve) => {
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
  prefix: pkg,
  name: 'stage3', 
  fn: async (context) => { 
    return await new Promise( (resolve) => {
      setTimeout(() => {
        resolve(context);
      }, 250); 
    })
  },
  circuitbreaker: {
    enabled: true,
    timeout: 200,
    action: 1,
    fn: `${pkg}.fallback`
  }  
});

test('Should break a stage if it spent more than 200 milliseconds', async () => {
  const context = chupim.createContext();
  const pipeline = chupim.registerComponent({
    id: 'circuit-breaker-test1',
    name:'CircuitBreakerTest1',
    stages:[`${pkg}.stage1`,`${pkg}.stage2`]
  });

  await expect(pipeline.fn(context)).rejects.toThrow(`Timeout on: ${pkg}.stage2.`);
});

test('Should fallback a stage if it spent more than 200 milliseconds', async () => {
  const context = chupim.createContext();
  const pipeline = chupim.registerComponent({
    id: 'circuit-breaker-test2',
    name:'CircuitBreakerTest2',
    stages:[`${pkg}.stage1`,`${pkg}.stage3`]
  });

  const r = await pipeline.fn(context);
  expect(r, 'Has pipeline result').toBeDefined();
  expect(r.fallback, 'Result has a fallback information').toBe('ok');
});
