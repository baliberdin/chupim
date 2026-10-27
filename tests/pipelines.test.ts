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
for (const name of ['stage1', 'stage2', 'stage3']) {
    chupim.registerStage({
        prefix: 'testPipeline',
        name: name,
        fn: async (c) => {
            return c;
        }
    });
}

const { stage1, stage2, stage3 } = chupim.stages.container.testPipeline;

test('Should Serial Pipeline returns a Promise', () => {
    const fn = chupim.pipelines.serialPipeline(chupim.createContext(), stage1);
    expect(fn).toBeInstanceOf(Promise);
});

test('Should wrap a pipeline stage when serial pipeline has only one stage.', async () => {
    const actual = await chupim.pipelines.serialPipeline(chupim.createContext(), stage1);

    expect(actual._chupim_.metadata, 'Has Metadata Object').toBeDefined();
    expect(actual._chupim_.metadata.stages_info, 'Has Only one stage info').toHaveLength(1);
    expect(actual._chupim_.metadata.stages_info[0].name, 'Has the right stage name').toBe('stage1');
});

test('Should wrap pipeline stages when serial pipeline has two stages.', async () => {
    const actual = await chupim.pipelines.serialPipeline(chupim.createContext(), stage1, stage2);

    expect(actual._chupim_.metadata, 'Has Metadata Object').toBeDefined();
    expect(actual._chupim_.metadata.stages_info, 'Has two stage info').toHaveLength(2);
    expect(actual._chupim_.metadata.stages_info.map((s: {name: string}) => s.name)).toEqual(['stage1', 'stage2']);
});

test('Should wrap pipeline stages when serial pipeline has three stages.', async () => {
    const actual = await chupim.pipelines.serialPipeline(chupim.createContext(), stage1, stage2, stage3);

    expect(actual._chupim_.metadata, 'Has Metadata Object').toBeDefined();
    expect(actual._chupim_.metadata.stages_info, 'Has three stage info').toHaveLength(3);
    expect(actual._chupim_.metadata.stages_info.map((s: {name: string}) => s.name)).toEqual(['stage1', 'stage2', 'stage3']);
});

test('Should return the context when serial pipeline has no stages.', async () => {
    const context = chupim.createContext();
    const actual = await chupim.pipelines.serialPipeline(context);

    expect(actual).toBe(context);
});

test('Should not fail when a component has only unknown stages.', async () => {
    const context = chupim.createContext();
    context._chupim_.params.debug = true;
    const component = chupim.registerComponent({id: 'unknownStages', stages: ['testPipeline.doesNotExist']});

    const actual = await component.fn(context);
    expect(actual).toBe(context);
    expect(actual._chupim_.metadata.stages_info).toHaveLength(0);
});
