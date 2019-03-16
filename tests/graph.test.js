const test = require('tape');
const chupim = require('../');

// Registering stages for test
chupim.stages.register({
  prefix: 'testGraph',
  name: 'stage1', 
  fn: async (c) => {
    console.log('testGraph'); 
    return c;
  }
});

chupim.stages.register({
  prefix: 'testGraph',
  name: 'stage2', 
  fn: async (c) => {
    console.log('testGraph'); 
    return c;
  }
});

test('Should parse stage config to graph elements', t => {
  let config = {
    stages:['testGraph.stage1','testGraph.stage2',[ ['testGraph.stage3'], ['testGraph.stage4'] ], 'testGraph.stage5','testGraph.stage6']
  };

  let expectedElements = {
    nodes:[
      { data:{ id:'Input', label:'Input', type:'source' } },
      { data: { id:'Output', label:'Output', type:'sink' } },
      { data: { id:'0.1', label: 'stage1', type: 'testGraph', configName: 'testGraph.stage1'} },
      { data: { id:'0.2', label: 'stage2', type: 'testGraph', configName: 'testGraph.stage2'} },
      { data: { id:'2.1', label: 'stage3', type: 'testGraph', configName: 'testGraph.stage3'} },
      { data: { id:'3.1', label: 'stage4', type: 'testGraph', configName: 'testGraph.stage4'} },
      { data: { id:'0.3', label: 'stage5', type: 'testGraph', configName: 'testGraph.stage5'} },
      { data: { id:'0.4', label: 'stage6', type: 'testGraph', configName: 'testGraph.stage6'} },
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