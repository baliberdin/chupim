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
import type { ParallelPipelineObject, GroupPipelineObject, SerialPipelineObject, StageList } from '../src';

// Registering stages for test
for (const name of ['stage1', 'stage2', 'stage3', 'stage4', 'stage5', 'stage6']) {
    chupim.registerStage({
        prefix: 'test',
        name: name,
        fn: async (c) => {
            console.log('test');
            return c;
        }
    });
}

const config = {stages:["test.stage1", "test.stage2","test.stage3","test.stage4"]};
const parallelConfig: {stages: StageList} = {stages:[[["test.stage1","test.stage1"], ["test.stage1"]],"test.stage1"]};
const config4: {stages: StageList} = {stages:["test.stage1", [["test.stage1"],["test.stage1"]],"test.stage1"]};
const config5: {stages: StageList} = {stages:[ 
  [ 
    [ 'test.stage1', [['test.stage1'], ['test.stage1']], 'test.stage1' ],
    [ 'test.stage1' ],
    [ 'test.stage1' ],
    [ 'test.stage1' ] 
  ]
]};

test('Should create a list of Serial pipeline stages from Config', () => {
    const result = chupim.builder.getStagesByName(config.stages);

    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(4);
    result.forEach( s => {
        expect(s.fn.constructor.name, `${s.name} is AsyncFunction`).toBe('AsyncFunction');
    });
});

test('Should create a ordened list of Serial pipeline stages from Config', () => {
    const result = chupim.builder.getStagesByName(config.stages);

    expect(result.map(s => s.name)).toEqual(['stage1', 'stage2', 'stage3', 'stage4']);
});

test('Should detect if a list of stages is a Single Serial Pipeline', () => {
    expect(chupim.builder.isASingleSerialPipeline(config.stages)).toBe(true);
});

test('Should detect if a list of stages is NOT a Single Serial Pipeline', () => {
    expect(chupim.builder.isASingleSerialPipeline(parallelConfig.stages)).toBe(false);
});

test('Should detect if pipeline is mixed', () => {
  expect(chupim.builder.isAMixedPipeline(config4.stages)).toBe(true);
});

test('Should detect if pipeline is not mixed', () => {
  expect(chupim.builder.isAMixedPipeline(config.stages)).toBe(false);
});

test('Should create a correct pipeline structure for a Heterogeneous pipeline', () => {
    const pipeline = chupim.builder.stageConfigToPipelineObjects(config4.stages);
    expect(pipeline).toHaveLength(1);

    const group = pipeline[0] as GroupPipelineObject;
    expect(group.type).toBe('group');
    expect(group.pipelines.map(p => p.type)).toEqual(['serial', 'parallel', 'serial']);

    const first = group.pipelines[0] as SerialPipelineObject;
    const second = group.pipelines[1] as ParallelPipelineObject;
    const third = group.pipelines[2] as SerialPipelineObject;

    expect(first.names, 'First pipeline has only one Stage').toHaveLength(1);
    expect(second.pipelines, 'Second pipeline has two pipelines').toHaveLength(2);
    expect(second.pipelines[0].type).toBe('serial');
    expect(second.pipelines[1].type).toBe('serial');
    expect(third.names, 'Third pipeline has only one Stage').toHaveLength(1);
});

test('Should create a correct pipeline structure for a MultiParallel pipeline', () => {
    const pipeline = chupim.builder.stageConfigToPipelineObjects(config5.stages);
    expect(pipeline).toHaveLength(1);

    const parallel = pipeline[0] as ParallelPipelineObject;
    expect(parallel.type).toBe('parallel');
    expect(parallel.pipelines.map(p => p.type)).toEqual(['group', 'serial', 'serial', 'serial']);

    const group = parallel.pipelines[0] as GroupPipelineObject;
    expect(group.pipelines.map(p => p.type)).toEqual(['serial', 'parallel', 'serial']);
});
