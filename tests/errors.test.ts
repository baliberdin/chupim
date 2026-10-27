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
chupim.registerStage({
    prefix: 'errorPipeline',
    name: 'stage1', 
    fn: async (c) => {
      // @ts-expect-error Undefined var for error test
      j++;
      return c;
    }
});

test('Should register error under a stage key if stage throw exception inside a pipeline', async () => {
  try{
    const comp = chupim.registerComponent({
      id:'errorComponent',
      name:'Error Pipeline',
      stages: ['errorPipeline.stage1']
    });
    await comp.fn(chupim.createContext());
  }catch(e){
    //console.log(e);
  }

  const errorLog = chupim.errors.filteredByKey('errorPipeline.stage1');

  expect(errorLog, 'Has error log under a stage key').toHaveLength(1);
  expect(errorLog[0].error, 'Has error log').toBeDefined();
});
