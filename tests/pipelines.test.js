const test = require('tape');
const chupim = require('../index.js');

// Registering stages for test
chupim.stages.register('test','stage1', async (c) => {
    return c;
});

chupim.stages.register('test','stage2', async (c) => {
    return c;
});

chupim.stages.register('test','stage3', async (c) => {
    return c;
});

chupim.stages.register('test','stage4', async (c) => {
    return c;
});

chupim.stages.register('test','stage5', async (c) => {
    return c;
});

chupim.stages.register('test','stage6', async (c) => {
    return c;
});

test('Should Serial Pipeline returns a Promise', (t) => {
    var fn = chupim.pipelines.serialPipeline(chupim.createContext(), chupim.stages.test.stage1);
    t.assert(fn.constructor === Promise, 'Promise returned.');
    t.end();
});

test('Should wrap a pipeline stage when serial pipeline has only one stage.', (t) => {
    var fn = chupim.pipelines.serialPipeline(chupim.createContext(), chupim.stages.test.stage1).then( actual => {
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
            chupim.stages.test.stage1, 
            chupim.stages.test.stage2
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
            chupim.stages.test.stage1, 
            chupim.stages.test.stage2,
            chupim.stages.test.stage3
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