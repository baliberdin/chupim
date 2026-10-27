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

test('Should register a new component with only id, name and stages', () => {
  const pipeline = chupim.registerComponent({
    id: 'parse_text_test',
    name:'Parse Text Test',
    stages:['myPackage.myLowercaseStage', 'myPackage.mySplitParagraphStage']
  });

  expect(pipeline, 'Pipeline has been created').toBeDefined();
  expect(pipeline.fn.constructor.name).toBe('AsyncFunction');
  expect(pipeline.id).toBe('parse_text_test');
  expect(pipeline.name).toBe('Parse Text Test');
});

test('Should not throw exception when pipeline is executed without extra parameters', async () => {
  const context = chupim.createContext();
  const pipeline = chupim.registerComponent({
    id: 'test',
    name:'Test',
    stages:['test.stage1', 'test.stage2']
  });

  const r = await pipeline.fn(context);
  expect(r, 'Has pipeline result').toBeDefined();
});

test('Pipeline should throw exception when first inner stage rise an error', async () => {
  const context = chupim.createContext();
  const pipeline = chupim.registerComponent({
    id: 'test',
    name:'Test',
    stages:['test.errorStage']
  });

  await expect(pipeline.fn(context)).rejects.toThrow('Default error.');
});
