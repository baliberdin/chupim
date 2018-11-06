const test = require('tape');
const chupim = require('../chupim');

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

test('All stages should be a Async Function', (t) => {
    var stagesList = Object.keys(chupim.stages.test).map( k =>  chupim.stages.test[k]);
    stagesList.forEach( i => t.assert(i.fn.constructor.name == 'AsyncFunction',`[Is Async Function] - ${i.name}`));
    t.end();
});

test('Should throw error if prefix was undefined', (t) => {
    let prefix = undefined;
    let name = 'newStage';
    let source = 'async (context) => {console.log(\"Teste\");}';

    t.throws( function(){chupim.stages.register(prefix, name, source);}, 'Empty prefix was identified');
    t.end();
});

test('Should throw error if stage name was undefined', (t) => {
    let prefix = 'prefix';
    let name = undefined;
    let source = 'async (context) => {console.log(\"Teste\");}';

    t.throws( function(){chupim.stages.register(prefix, name, source);}, 'Empty stage name was identified');
    t.end();
});

test('Should not register a new Stage if source was not a async function', (t) => {
    let prefix = 'prefix';
    let name = 'newStage';
    let source = 'console.log(\"Teste\");';

    t.throws( function(){ chupim.stages.register(prefix, name, source); });
    t.end();
});

test('Should register stage from native function', (t) => {
    chupim.stages.register('native','newStage', async (c) => {
        console.log("Ok");
    });

    t.equals(chupim.stages.native.newStage.fn.constructor.name, 'AsyncFunction', 'New Stage is a Function');
    t.equals(chupim.stages.native.newStage.name, 'newStage', 'New Stage has a correct name');
    t.end();
});