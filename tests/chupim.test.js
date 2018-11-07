const test = require('tape');
const chupim = require('../index.js');

test('Should register a new component with only id, name and stages', t => {
  let pipeline = chupim.registerComponent({
    id: 'parse_text_test',
    name:'Parse Text Test',
    stages:['myPackage.myLowercaseStage', 'myPackage.mySplitParagraphStage']
  });

  t.assert(pipeline != undefined, 'Pipeline has been created');
  t.assert(pipeline.fn.constructor.name == 'AsyncFunction');
  t.assert(pipeline.id == 'parse_text_test');
  t.assert(pipeline.name == 'Parse Text Test');
  t.end();
});