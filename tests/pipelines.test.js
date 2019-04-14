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
    prefix: 'testPipeline',
    name: 'stage1', 
    fn: async (c) => {
        return c;
    }
});

chupim.registerStage({
    prefix: 'testPipeline',
    name: 'stage2', 
    fn: async (c) => {
        return c;
    }
});

chupim.registerStage({
    prefix: 'testPipeline',
    name: 'stage3', 
    fn: async (c) => {
        return c;
    }
});


test('Should Serial Pipeline returns a Promise', (t) => {
    var fn = chupim.pipelines.serialPipeline(chupim.createContext(), chupim.stages.container.testPipeline.stage1);
    t.assert(fn.constructor === Promise, 'Promise returned.');
    t.end();
});

test('Should wrap a pipeline stage when serial pipeline has only one stage.', (t) => {
    var fn = chupim.pipelines.serialPipeline(chupim.createContext(), chupim.stages.container.testPipeline.stage1).then( actual => {
        t.assert(actual._chupim_.metadata != undefined, 'Has Metadata Object');
        t.assert(actual._chupim_.metadata.stages_info != undefined, 'Has Stages Information');
        t.assert(actual._chupim_.metadata.stages_info.length == 1, 'Has Only one stage info');
        t.assert(actual._chupim_.metadata.stages_info[0].name == 'stage1', 'Has the right stage name');
        t.end();
    });
});

test('Should wrap pipeline stages when serial pipeline has two stages.', (t) => {
    var fn = chupim.pipelines
        .serialPipeline(
            chupim.createContext(), 
            chupim.stages.container.testPipeline.stage1, 
            chupim.stages.container.testPipeline.stage2
        ).then( actual => {
            t.assert(actual._chupim_.metadata != undefined, 'Has Metadata Object');
            t.assert(actual._chupim_.metadata.stages_info != undefined, 'Has Stages Information');
            t.assert(actual._chupim_.metadata.stages_info.length == 2, 'Has two stage info');
            t.assert(actual._chupim_.metadata.stages_info[0].name == 'stage1', 'Has the right stage name on first index');
            t.assert(actual._chupim_.metadata.stages_info[1].name == 'stage2', 'Has the right stage name on second index');
            t.end();
        });
});

test('Should wrap pipeline stages when serial pipeline has three stages.', (t) => {
    var fn = chupim.pipelines
        .serialPipeline(
            chupim.createContext(), 
            chupim.stages.container.testPipeline.stage1, 
            chupim.stages.container.testPipeline.stage2,
            chupim.stages.container.testPipeline.stage3
        ).then( actual => {
            t.assert(actual._chupim_.metadata != undefined, 'Has Metadata Object');
            t.assert(actual._chupim_.metadata.stages_info != undefined, 'Has Stages Information');
            t.assert(actual._chupim_.metadata.stages_info.length == 3, 'Has three stage info');
            t.assert(actual._chupim_.metadata.stages_info[0].name == 'stage1', 'Has the right stage name on first index');
            t.assert(actual._chupim_.metadata.stages_info[1].name == 'stage2', 'Has the right stage name on second index');
            t.assert(actual._chupim_.metadata.stages_info[2].name == 'stage3', 'Has the right stage name on third index');
            t.end();
        });
});