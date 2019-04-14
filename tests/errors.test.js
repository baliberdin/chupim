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


const test = require('tape');
const chupim = require('../index.js');

// Registering stages for test
chupim.registerStage({
    prefix: 'errorPipeline',
    name: 'stage1', 
    fn: async (c) => {
      j++; // Undefined var for error test
      return c;
    }
});

test('Should register error under a stage key if stage throw exception inside a pipeline', async (t) => {
  try{
    let comp = chupim.registerComponent({
      id:'errorComponent',
      name:'Error Pipeline',
      stages: ['errorPipeline.stage1']
    });
    await comp.fn(chupim.createContext());
  }catch(e){
    //console.log(e);
  }

  let errorLog = chupim.errors.filteredByKey('errorPipeline.stage1');

  t.assert(errorLog.length == 1, 'Has error log under a stage key');
  t.assert(errorLog[0].error != undefined, 'Has error log');
  t.end();
});