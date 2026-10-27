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
import type { StageDefinition } from '../src';

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

test('All stages should be an Async Function', () => {
    const stagesList = Object.values(chupim.stages.container.testPipeline);
    expect(stagesList).toHaveLength(3);
    stagesList.forEach( i => expect(i.fn.constructor.name, `[Is Async Function] - ${i.name}`).toBe('AsyncFunction'));
});

test('Should throw error if prefix was undefined', () => {
    const stage = {prefix: undefined, name: 'newStage1', fn: async () => {console.log("Teste");}};

    expect(() => chupim.registerStage(stage as unknown as StageDefinition), 'Empty prefix was identified').toThrow('Invalid prefix or stage name.');
});

test('Should throw error if stage name was undefined', () => {
    const stage = {prefix: 'prefix', name: undefined, fn: async () => {console.log("Teste");}};

    expect(() => chupim.registerStage(stage as unknown as StageDefinition), 'Empty stage name was identified').toThrow('Invalid prefix or stage name.');
});

test('Should not register a new Stage if source was not an async function', () => {
    const stage = {
        prefix: 'prefix',
        name: 'newStage2',
        fn: 'console.log(\"Teste\");'
    };

    expect(() => chupim.registerStage(stage as unknown as StageDefinition)).toThrow('Invalid Stage. Stages must be Async Function.');
});

test('Should register stage from native function', () => {
    chupim.stages.register({
        prefix: 'native',
        name: 'newStage3', 
        fn: async (c) => {
            console.log("Ok");
        }
    });

    expect(chupim.stages.container.native, 'The Package has been registered').toBeDefined();
    expect(chupim.stages.container.native['newStage3'], 'The Stage has been registered').toBeDefined();
    expect(chupim.stages.container.native['newStage3'].fn.constructor.name, 'New Stage is a Function').toBe('AsyncFunction');
    expect(chupim.stages.container.native['newStage3'].name, 'New Stage has a correct name').toBe('newStage3');
});

test('Should register stage from api upper level', () => {
    chupim.registerStage({
        prefix: 'native',
        name: 'newStage4', 
        fn: async (c) => {
            console.log("Ok");
        }
    });

    expect(chupim.stages.container.native, 'The Package has been registered').toBeDefined();
    expect(chupim.stages.container.native['newStage4'], 'The Stage has been registered').toBeDefined();
    expect(chupim.stages.container.native['newStage4'].fn.constructor.name, 'New Stage is a Function').toBe('AsyncFunction');
    expect(chupim.stages.container.native['newStage4'].name, 'New Stage has a correct name').toBe('newStage4');
});

test('Should Return Stage when register with success', () => {
    const testStage = chupim.registerStage({
        prefix: 'newStageAPI',
        name: 'returnStage', 
        fn: async (c) => {
            return c;
        }
    });

    expect(testStage.key()).toBe("newStageAPI.returnStage");
});

test('Should allow point character on prefix', () => {
    const prefix = "com.chupim.example";
    const name = 'newStage1';
    const source = async () => {console.log("Test");};

    expect(() => chupim.registerStage({prefix:prefix, name:name, fn:source}), 'Pointed prefix was allowed').not.toThrow();
});

test('Should find stages with point character on prefix', () => {
    const prefix = "com.chupim.example";
    const name = 'newStage1';
    const source = async () => {console.log("Test");};

    chupim.registerStage({prefix:prefix, name:name, fn:source});
    const stage = chupim.getStageByPackage(prefix, name);

    expect(stage, 'Stage with Pointed prefix was found').toBeDefined();
    expect(stage!.name, 'Stage name with Pointed prefix was correct').toBe(name);
    expect(stage!.prefix, 'Stage prefix with Pointed prefix was correct').toBe(prefix);
});

test('Should stages with point character on prefix Works', async () => {
    const prefix = "com.chupim.example";
    const name = 'newStage1';
    const source = async () => { let a = 10, b = 20; return a+b;};

    chupim.registerStage({prefix:prefix, name:name, fn:source});
    const stage = chupim.getStageByPackage(prefix, name)!;
    const fn = stage.fn as unknown as () => Promise<number>;

    expect(() => fn(), 'Pointed prefix was Executed with success').not.toThrow();
    expect(await fn(), 'Pointed prefix stage was returned value with success').toBe(30);
});
