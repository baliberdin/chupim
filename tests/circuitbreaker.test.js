const test = require('tape')
const chupim = require('../');

// Registering stages for test
const package = "testCircuitBreaker";
chupim.registerStage({
  prefix: package,
  name: 'stage1', 
  fn: async (c) => {
    return c;
  }
});

chupim.registerStage({
  prefix: package,
  name: 'fallback', 
  fn: async (c) => {
    c.fallback = 'ok';
    return c;
  }
});

chupim.registerStage({
  prefix: package,
  name: 'stage2', 
  fn: async (context) => { 
    return await new Promise( (resolve, reject) => {
      setTimeout(() => {
        resolve(context);
      }, 250); 
    })
  },
  circuitbreaker: {
    enabled: true,
    timeout: 200,
    action: 0
  }
});

chupim.registerStage({
  prefix: package,
  name: 'stage3', 
  fn: async (context) => { 
    return await new Promise( (resolve, reject) => {
      setTimeout(() => {
        resolve(context);
      }, 250); 
    })
  },
  circuitbreaker: {
    enabled: true,
    timeout: 200,
    action: 1,
    fn: `${package}.fallback`
  }  
});

test('Should break a stage if it spent more than 200 milliseconds', (t) => {
  let context = chupim.createContext();
  let pipeline = chupim.registerComponent({
    id: 'circuit-breaker-test1',
    name:'CircuitBreakerTest1',
    stages:[`${package}.stage1`,`${package}.stage2`]
  });

  pipeline.fn(context).then(r => {
    t.assert(r == undefined, 'Has pipeline result');
    t.fail('Pipeline does not throw exception');
    t.end();
  }).catch(e => {
    t.assert(e != undefined, 'Has an error message');
    t.end();
  });
});

test('Should fallback a stage if it spent more than 200 milliseconds', (t) => {
  let context = chupim.createContext();
  let pipeline = chupim.registerComponent({
    id: 'circuit-breaker-test2',
    name:'CircuitBreakerTest2',
    stages:[`${package}.stage1`,`${package}.stage3`]
  });

  pipeline.fn(context).then(r => {
    t.assert(r != undefined, 'Has pipeline result');
    t.assert(r.fallback == 'ok', 'Result has a fallback information');
    t.end();
  }).catch(e => {
    t.fail('Has an error message');
    t.end();
  });
});