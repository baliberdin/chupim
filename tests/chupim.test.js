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
const chupim = require('../');

// Registering stages for test
chupim.stages.register({
  prefix: 'test',
  name: 'stage1', 
  fn: async (c) => {
    return c;
  }
});

chupim.stages.register({
  prefix: 'test',
  name: 'stage2', 
  fn: async (c) => { 
    return c;
  }
});

chupim.stages.register({
  prefix: 'test',
  name: 'errorStage', 
  fn: async (c) => {
    throw new Error('Default error.');
  }
});

test('Should register a new component with only id, name and stages', t => {
  let pipeline = chupim.registerComponent({
    id: 'parse_text_test',
    name:'Parse Text Test',
    stages:['myPackage.myLowercaseStage', 'myPackage.mySplitParagraphStage']
  });

  t.assert(pipeline != undefined, 'Pipeline has been created');
  t.assert(pipeline.fn.constructor.name == 'AsyncFunction');
  t.assert(pipeline.id == 'parse_text_test');
  t.assert(pipeline.name == 'Parse Text Test');
  t.end();
});

test('Should not throw exception when pipeline is executed without extra parameters', t => {
  let context = chupim.createContext();
  let pipeline = chupim.registerComponent({
    id: 'test',
    name:'Test',
    stages:['test.stage1', 'test.stage2']
  });

  pipeline.fn(context).then(r => {
    t.assert(r != undefined, 'Has pipeline result');
    t.end();
  }).catch(e => {
    t.fail('Pipeline has failed');
    t.end(e);
  });
});

test('Pipeline should throw exception when first inner stage rise an error', t => {
  let context = chupim.createContext();
  let pipeline = chupim.registerComponent({
    id: 'test',
    name:'Test',
    stages:['test.errorStage']
  });

  pipeline.fn(context).then(r => {
    t.assert(r == undefined, 'Has pipeline result');
    t.fail('Pipeline does not throw exception');
    t.end();
  }).catch(e => {
    t.assert(e != undefined);
    t.end();
  });

});