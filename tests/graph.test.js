const test = require('tape');
const chupim = require('../');

// Registering stages for test
chupim.stages.register('test','stage1', async (c) => {
  console.log('test'); 
  return c;
});

chupim.stages.register('test','stage2', async (c) => {
  console.log('test'); 
  return c;
});

test('Should parse stage config to graph elements', t => {
  let config = {
    stages:['test.stage1','test.stage2',[ ['test.stage3'], ['test.stage4'] ], 'test.stage5','test.stage6']
  };

  let expectedElements = {
    nodes:[
      { data:{ id:'Input', label:'Input', type:'source' } },
      { data: { id:'Output', label:'Output', type:'sink' } },
      { data: { id:'0.1', label: 'stage1', type: 'test', configName: 'test.stage1'} },
      { data: { id:'0.2', label: 'stage2', type: 'test', configName: 'test.stage2'} },
      { data: { id:'2.1', label: 'stage3', type: 'test', configName: 'test.stage3'} },
      { data: { id:'3.1', label: 'stage4', type: 'test', configName: 'test.stage4'} },
      { data: { id:'0.3', label: 'stage5', type: 'test', configName: 'test.stage5'} },
      { data: { id:'0.4', label: 'stage6', type: 'test', configName: 'test.stage6'} },
    ],
    edges:[
      { data:{ source: 'Input', target: '0.1' } },
      { data:{ source: '0.1', target: '0.2' } },
      { data:{ source: '0.2', target: '2.1' } },
      { data:{ source: '0.2', target: '3.1' } },
      { data:{ source: '2.1', target: '0.3' } },
      { data:{ source: '3.1', target: '0.3' } },
      { data:{ source: '0.3', target: '0.4' } },
      { data:{ source: '0.4', target: 'Output' } }
      
    ]
  };
  
  let elements = chupim.graph.parseElements(config);

  t.deepEquals(elements, expectedElements);
  t.end();
});