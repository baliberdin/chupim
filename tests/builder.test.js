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
    prefix: 'test',
    name: 'stage1', 
    fn: async (c) => {
        console.log('test'); 
        return c;
    }
});

chupim.registerStage({
    prefix: 'test',
    name: 'stage2', 
    fn: async (c) => {
        console.log('test'); 
        return c;
    }
});

chupim.registerStage({
    prefix: 'test',
    name: 'stage3', 
    fn: async (c) => {
        console.log('test'); 
        return c;
    }
});

chupim.registerStage({
    prefix: 'test',
    name: 'stage4', 
    fn: async (c) => {
        console.log('test'); 
        return c;
    }
});

chupim.registerStage({
    prefix: 'test',
    name: 'stage5', 
    fn: async (c) => {
        console.log('test'); 
        return c;
    }
});

chupim.registerStage({
    prefix: 'test',
    name: 'stage6', 
    fn: async (c) => {
        console.log('test'); 
        return c;
    }
});


var config = {stages:["test.stage1", "test.stage2","test.stage3","test.stage4"]};
var parallelConfig = {stages:[[["test.stage1","test.stage1"], ["test.stage1"]],"test.stage1"]};
var config4 = {stages:["test.stage1", [["test.stage1"],["test.stage1"]],"test.stage1"]};
var config5 = {stages:[ 
  [ 
    [ 'test.stage1', [['test.stage1'], ['test.stage1']], 'test.stage1' ],
    [ 'test.stage1' ],
    [ 'test.stage1' ],
    [ 'test.stage1' ] 
  ]
]};

test('Should create a list of Serial pipeline stages from Config', (t) => {
    var result = chupim.builder.getStagesByName(config.stages);

    t.equal(result.constructor, Array, 'Result is an array');
    t.assert(result.length == 4, 'Has all configured stages');
    result.map( s => {
        t.equal(s.fn.constructor.name, 'AsyncFunction', `${s.name} is AsyncFunction`);
    });
    t.end();
});

test('Should create a ordened list of Serial pipeline stages from Config', (t) => {
    var result = chupim.builder.getStagesByName(config.stages);

    t.equal(result[0].name, 'stage1', `${result[0].name} is on correct index`);
    t.equal(result[1].name, 'stage2', `${result[1].name} is on correct index`);
    t.equal(result[2].name, 'stage3', `${result[2].name} is on correct index`);
    t.equal(result[3].name, 'stage4', `${result[3].name} is on correct index`);
    t.end();
});

test('Should detect if a list of stages is a Single Serial Pipeline', (t) => {
    t.assert(chupim.builder.isASingleSerialPipeline(config.stages));
    t.end();
});

test('Should detect if a list of stages is NOT a Single Serial Pipeline', (t) => {
    t.false(chupim.builder.isASingleSerialPipeline(parallelConfig.stages));
    t.end();
});

test('Should detect if pipeline is mixed', (t) => {
  t.assert(chupim.builder.isAMixedPipeline(config4.stages));
  t.end();
});

test('Should detect if pipeline is not mixed', (t) => {
  t.assert(!chupim.builder.isAMixedPipeline(config.stages));
  t.end();
});

test('Should create a correct pipeline structure for a Heterogeneous pipeline', (t) => {
    var pipeline = chupim.builder.stageConfigToPipelineObjects(config4.stages);
      
      t.true(pipeline.length == 1, 'Has 1 group pipelines');
      t.assert(pipeline[0].type == 'group', 'First pipeline is a group');
      t.assert(pipeline[0].pipelines[0].type == 'serial', 'First pipeline is serial');
      t.assert(pipeline[0].pipelines[1].type == 'parallel', 'Second pipeline is parallel');
      t.assert(pipeline[0].pipelines[2].type == 'serial', 'Third pipeline is serial');

      t.true(pipeline[0].pipelines[0].names.length == 1, 'First pipeline has only one Stage');
      t.true(pipeline[0].pipelines[1].pipelines.length == 2, 'Second pipeline has two pipelines');
      t.true(pipeline[0].pipelines[1].pipelines[0].type == 'serial', 'First pipeline of Second pipeline is serial');
      t.true(pipeline[0].pipelines[1].pipelines[1].type == 'serial', 'Second pipeline of Second pipeline is serial');
      t.true(pipeline[0].pipelines[2].names.length == 1, 'Third pipeline has only one Stage');

    t.end();
});

test('Should create a correct pipeline structure for a MultiParallel pipeline', (t) => {
    var pipeline = chupim.builder.stageConfigToPipelineObjects(config5.stages);

    t.true(pipeline.length == 1, 'Has only 1 pipeline');
    t.assert(pipeline[0].type == 'parallel', 'First pipeline is parallel');
    t.true(pipeline[0].pipelines.length == 4, 'First pipeline has four pipelines');
    t.true(pipeline[0].pipelines[0].type == 'group', 'First internal pipeline is a group');
    t.true(pipeline[0].pipelines[0].pipelines.length == 3, 'First internal pipeline group has 3 pipelines');
    t.true(pipeline[0].pipelines[0].pipelines[0].type == 'serial', 'Pipeline group. First pipeline is serial');
    t.true(pipeline[0].pipelines[0].pipelines[1].type == 'parallel', 'Pipeline group. First pipeline is parallel');
    t.true(pipeline[0].pipelines[0].pipelines[2].type == 'serial', 'Pipeline group. First pipeline is serial');
    t.true(pipeline[0].pipelines[1].type == 'serial', 'Second internal pipeline is serial');
    t.true(pipeline[0].pipelines[2].type == 'serial', 'Third internal pipeline is serial');
    t.true(pipeline[0].pipelines[3].type == 'serial', 'Fourth internal pipeline is serial');
    
  t.end();
});
