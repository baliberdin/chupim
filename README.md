# chupim ![Master Build](https://travis-ci.org/baliberdin/chupim.svg?branch=master)
Core module for chupim-web project.
Please visit [Chupim Web Project](https://github.com/baliberdin/chupim-web)

Chupim is a javascript **Pipeline Builder** (NodeJS module) that you can define and organize your 
flow in a simple way, just by connecting the stages. **Stages** are asynchronous functions that 
you must implement to do something. Each stage is connected to another, so the output of the 
first stage is the input of the second stage and so on ...

The first entry to the first stage is something we call context.
**Context** is just a JSON object that doesn't have fixed schema. You can put almost anything into it.

Let's see some examples of how to use chupim on a simple pipeline to transform text.

```javascript
// Import Chupim module
const chupim = require('./');

// Register new stage
chupim.stages.register('myPackage','myLowercaseStage', async (context) => {
  context.text = context.text.toLowerCase();
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
  stages:['myPackage.myLowercaseStage', 'myPackage.mySplitParagraphStage']
});

// Create an empty context
var context = chupim.createContext();
// Set chupim to debug mode. It will keep metadata information on context object.
context._chupim_.params.debug = true;

// Put the text on context
context.text = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, "+
  "sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. "+
  "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi "+
  "ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit "+
  "in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint "+
  "occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.";

pipeline.fn(context).then( result => {
  console.log(result);
});
```

You will see something like that:
```javascript
{ _chupim_: 
   { params: { debug: true },
     metadata: { stages_info: [Array], stage: 2, totalTime: 0 } },
  text: 'lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
  paragraphs: 
   [ 'lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua',
     'ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat',
     'duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur',
     'excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.' ] }
     
```