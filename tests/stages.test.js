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

test('All stages should be an Async Function', (t) => {
    var stagesList = Object.keys(chupim.stages.container.test).map( k =>  chupim.stages.container.test[k]);
    stagesList.forEach( i => t.assert(i.fn.constructor.name == 'AsyncFunction',`[Is Async Function] - ${i.name}`));
    t.end();
});

test('Should throw error if prefix was undefined', (t) => {
    let prefix = undefined;
    let name = 'newStage1';
    let source = 'async (context) => {console.log(\"Teste\");}';

    t.throws( function(){chupim.registerStage(prefix, name, source);}, 'Empty prefix was identified');
    t.end();
});

test('Should throw error if stage name was undefined', (t) => {
    let prefix = 'prefix';
    let name = undefined;
    let source = 'async (context) => {console.log(\"Teste\");}';

    t.throws( function(){chupim.registerStage(prefix, name, source);}, 'Empty stage name was identified');
    t.end();
});

test('Should not register a new Stage if source was not an async function', (t) => {
    let stage = {
        prefix: 'prefix',
        name: 'newStage2',
        fn: 'console.log(\"Teste\");'
    };

    t.throws( function(){ chupim.registerStage(stage); });
    t.end();
});

test('Should register stage from native function', (t) => {
    chupim.registerStage({
        prefix: 'native',
        name: 'newStage3', 
        fn: async (c) => {
            console.log("Ok");
        }
    });

    try{
        t.assert(chupim.stages.container.native != undefined, 'The Package has not been registered');
        t.assert(chupim.stages.container.native['newStage3'] != undefined, 'The Stage has not been registered');
        t.equals(chupim.stages.container.native['newStage3'].fn.constructor.name, 'AsyncFunction', 'New Stage is a Function');
        t.equals(chupim.stages.container.native['newStage3'].name, 'newStage3', 'New Stage has a correct name');
    }catch(e){}

    t.end();
});

test('Should register stage from upper level of api', (t) => {
    chupim.registerStage({
        prefix: 'native',
        name: 'newStage4', 
        fn: async (c) => {
            console.log("Ok");
        }
    });

    try{
        t.assert(chupim.stages.container.native != undefined, 'The Package has not been registered');
        t.assert(chupim.stages.container.native['newStage4'] != undefined, 'The Stage has not been registered');
        t.equals(chupim.stages.container.native['newStage4'].fn.constructor.name, 'AsyncFunction', 'New Stage is a Function');
        t.equals(chupim.stages.container.native['newStage4'].name, 'newStage4', 'New Stage has a correct name');
    }catch(e){}

    t.end();
});