# Chupim 
![Master Build](https://travis-ci.org/baliberdin/chupim.svg?branch=master)
- [Chupim](#chupim)
    - [Overview](#overview)
    - [Simple Example](#simple-example)
  - [Advanced Stages Arrangement](#advanced-stages-arrangement)
  - [Circuit Breaker](#circuit-breaker)


### Overview
Core module for chupim-web project. Please visit [Chupim Web Project](https://github.com/baliberdin/chupim-web) a Web UI with diagrams to administer chupim pipelines.

Chupim is a javascript **Pipeline Builder** (NodeJS module) that you can define and organize your flow in a simple way, just by connecting the stages. **Stages** are asynchronous functions that you must implement to do something. Each stage is connected to another, so the output of the first stage is the input of the second stage and so on ...
The first entry to the first stage is something we call context.
**Context** is just a JSON object that doesn't have fixed schema. You can put almost anything into it.
The chupim allows you to build from a simple serial pipeline to parallel pipelines and mixed pipelines
Let's see some examples of how to use chupim on a simple pipeline to transform text.


### Simple Example
Create a new folder
```shell
mkdir chupim-test
cd chupim-test
```

Initialize npm. Run this command and answer the questions
```shell
npm init
```

Installing chupim
```shell
npm install -s chupim
```

Create a new file test.js
```javascript
// Import Chupim module
const chupim = require('chupim');

// Register new stage
chupim.registerStage({
  prefix: 'myPackage',
  name: 'myLowercaseStage', 
  fn: async (context) => {
    context.text = context.text.toLowerCase();
    // To continue and do not stop pipeline you need to return context or a new Promise 
    return context;
  }
});

// Register another stage to split in paragraph
chupim.registerStage({
  prefix: 'myPackage',
  name: 'mySplitParagraphStage', 
  fn: async (context) => {
    context.paragraphs = context.text.split(". ");
    return context;
  }
});

// Register a new component
const component = chupim.registerComponent({
  id: 'parse_text_test',
  name:'Parse Text Test',
  stages:['myPackage.myLowercaseStage', 'myPackage.mySplitParagraphStage']
});

// Creates an empty context
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

// Run component function.
// Result is the context object modified by pipeline stages
component.fn(context).then( result => {
  console.log(result);
});
```
Running
```shell
node test.js
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

The object ***_chupim_*** is a pipeline metadata, text and paragraphs are data created by pipeline stages.


## Advanced Stages Arrangement 
To construct advanced pipelines with Chupim we need to understand how chupim works with stages arrangements.
Every stage arrangement on chupim is defined by property [stages] on config of pipeline component.

```javascript
let config = {
  id: 'parse_text_test',
  name:'Parse Text Test',
  stages:['myPackage.myLowercaseStage', 'myPackage.mySplitParagraphStage']
};
const component = chupim.registerComponent(config);
```

On the example above there are two stages in serial mode which is represented by an unidimensional array. 
***['myPackage.myLowercaseStage', 'myPackage.mySplitParagraphStage']*** 

To transform the same example to an parallel pipeline just switch from unidimensional array to a matrix

```javascript
...
  // Pipeline with two stages in parallel
  stages:[
    [
      ['myPackage.myLowercaseStage'], 
      ['myPackage.mySplitParagraphStage']
    ]
  ]
...

```

The first element of first array is a bidimensional array, which means that each line is a single serial pipeline, but each one needs to be executed at the same time.

```javascript
...
  /* Another example
   Pipeline with two serial pipelines in parallel
  
             -> A -> B -> C
       in ->´              `->out
            `-> D -> E -> F´
  */
  stages:[
    [
      ['package.stageA', 'package.stageB', 'package.stageC',], 
      ['package.stageD', 'package.stageE', 'package.stageF',]
    ]
  ]
...

...
  /* Another example
   Pipeline with two serial pipelines in parallel and last one serial 
  
             -> A -> B -> C
       in ->´              `-> G -> H -> I -> out
            `-> D -> E -> F´
  */
  stages:[
    [
      ['package.stageA', 'package.stageB', 'package.stageC',], 
      ['package.stageD', 'package.stageE', 'package.stageF',]
    ],
    'package.stageG',
    'package.stageH',
    'package.stageI'
  ]
...

```
If you thought that it is hard or confusing, see the upper-level project ([Chupim Web](https://github.com/baliberdin/chupim-web)), and do that with just a few clicks on the UI.

## Circuit Breaker
Chupim is designed to create IO Bound pipelines. It means that stages should be a Service Facade to request data from another system, and of course, it could fail sometimes.
To protect your pipeline, The Chupim has a Circuit Breaker system.
This system operates with two triggers, timeout, and exceptions. If a stage spends more time than it should or throws an exception, the circuit breaker executes an action. These actions could be a Fallback Function or throw that error to upper layers of the system.
If the stage is optional, you could set a simple Fallback function to keep pipeline flow goes on. If not, you can throw the error to stop the pipeline.

```javascript

// Creates a Fallback Stage to set on circuitbreaker
chupim.registerStage({
  prefix: 'Fallback',
  name: 'ReturnContext', 
  fn: async (context) => {
    // Simple fallback function. Just Returns the context.
    return context;
  }
});

// Creates Stage with circuit breaker configuration
chupim.registerStage({
  prefix: 'myPackage',
  name: 'myOptionalStage', 
  fn: async (context) => {
    // here, code to facade to another optional system
    // eg: Request RSS news from BBC.
    return context;
  },
  circuitbreaker: {
    enabled: true,
    timeout: 200, // <- Time in miliseconds
    action: 1, // 0-Throw Error, 1-Fallback Function
    fn: 'Fallback.ReturnContext' // <- Fallback stage created before
  }
});
```