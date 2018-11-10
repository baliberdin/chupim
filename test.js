// Import Chupim module
const chupim = require('./');

// Register new stage
chupim.stages.register('myPackage','myTokenyzerStage', async (context) => {
  context.tokens = context.text.split(" ");
  // To continue and do not stop pipeline you need to return context 
  return context;
});

// Register another stage to split int paragraph
chupim.stages.register('myPackage','mySplitParagraphStage', async (context) => {
  context.paragraphs = context.text.split(". ");
  return context;
});

// Register a new component
const pipeline = chupim.registerComponent({
  id: 'parse_text_test',
  name:'Parse Text Test',
  stages:['myPackage.myTokenyzerStage', 'myPackage.mySplitParagraphStage']
});

// Create an empty context
var context = chupim.createContext();
// Set chupim to debug mode. It will keep metadata information on context object.
context._chupim_.params.debug = true;

// Put the text on context
context.text = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, "+
  "sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. "+
  "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi "+
  "ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit ";
  // "in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint "+
  // "occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.";

pipeline.fn(context).then( result => {
  console.log(result._chupim_.metadata);
});