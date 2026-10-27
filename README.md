# Chupim
[![CI](https://github.com/baliberdin/chupim/actions/workflows/ci.yml/badge.svg)](https://github.com/baliberdin/chupim/actions/workflows/ci.yml)

Chupim is a Node.js library for building pipelines of async functions. You
write small functions, called **stages**, and arrange them into **pipelines**
that run stages in sequence, in parallel or in any combination of both.

It was designed for I/O bound work, such as composing an API from other APIs
and services: each stage calls one service, and the pipeline puts the results
together. Stages that call slow or unreliable services can be protected with a
circuit breaker.

Chupim is the core of [Chupim Web](https://github.com/baliberdin/chupim-web),
a server with a web interface to create stages and draw pipelines in the
browser and publish them as HTTP endpoints.

- [Installation](#installation)
- [Quick start](#quick-start)
- [How it works](#how-it-works)
- [Arranging stages](#arranging-stages)
- [Circuit breaker](#circuit-breaker)
- [Errors and metrics](#errors-and-metrics)
- [TypeScript](#typescript)
- [Development](#development)

## Installation
Chupim requires Node.js 22 or later.

```shell
npm install chupim
```

## Quick start
This pipeline turns a text to lowercase and then splits it into sentences.

```javascript
const chupim = require('chupim');

// Stages are async functions that receive the context and return it
chupim.registerStage({
  prefix: 'text',
  name: 'lowercase',
  fn: async (context) => {
    context.text = context.text.toLowerCase();
    return context;
  }
});

chupim.registerStage({
  prefix: 'text',
  name: 'splitSentences',
  fn: async (context) => {
    context.sentences = context.text.split('. ');
    return context;
  }
});

// A pipeline references its stages by prefix.name
const pipeline = chupim.registerComponent({
  id: 'parse-text',
  name: 'Parse text',
  stages: ['text.lowercase', 'text.splitSentences']
});

const context = chupim.createContext();
context.text = 'Hello World. Chupim Builds Pipelines.';

pipeline.fn(context).then(result => console.log(result));
```

```shell
node index.js
```

```javascript
{
  text: 'hello world. chupim builds pipelines.',
  sentences: [ 'hello world', 'chupim builds pipelines.' ]
}
```

## How it works
**Context.** The object that goes through the pipeline. It has no fixed
structure: each stage reads what it needs from it and adds its results. The
context returned by the last stage is the result of the pipeline. Create it
with `chupim.createContext()`.

**Stages.** Async functions registered with `chupim.registerStage()`. Each one
receives the context and must return it, so it can be passed to the next stage.
To fail the pipeline, a stage throws an error. A stage is identified by its
`prefix` and `name`, written as `prefix.name`; the prefix only groups related
stages, like a package name.

**Pipelines.** Registered with `chupim.registerComponent()`, which takes an
`id`, an optional `name` and the arrangement of `stages`. It returns an object
whose `fn(context)` runs the pipeline and returns a promise with the result.
Stages are looked up when the pipeline runs, so they can be registered or
replaced after the pipeline.

**Debug metadata.** `createContext()` adds a `_chupim_` property to the context.
It is removed from the result unless debug mode is on:

```javascript
const context = chupim.createContext();
context._chupim_.params.debug = true;
```

With debug mode on, the result keeps the stages that ran, in order, and how
long each one took:

```javascript
{
  _chupim_: {
    params: { debug: true },
    metadata: {
      stages_info: [
        { name: 'lowercase', prefix: 'text', elapsedTime: 0, execution_indx: 0 },
        { name: 'splitSentences', prefix: 'text', elapsedTime: 0, execution_indx: 1 }
      ],
      executed_stages: 2,
      totalTime: 0
    }
  },
  text: 'hello world. chupim builds pipelines.',
  sentences: [ 'hello world', 'chupim builds pipelines.' ]
}
```

## Arranging stages
The `stages` property of a pipeline defines the order in which its stages run.

**In sequence.** A list of stage names runs one stage after the other:

```javascript
stages: ['text.lowercase', 'text.splitSentences']
```

**In parallel.** A list of lists inside the arrangement is a parallel block.
Each inner list is a branch, and all branches run at the same time:

```javascript
//         ┌→ splitSentences ┐
// input ──┤                 ├→ output
//         └→ countWords ────┘
stages: [
  [
    ['text.splitSentences'],
    ['text.countWords']
  ]
]
```

All branches receive the same context. When they finish, their results are
merged into a single context, in the order the branches were declared.

**Combined.** Sequences and parallel blocks can be combined freely, and a
branch can have many stages and its own parallel blocks:

```javascript
//         ┌→ A → B → C ┐
// input ──┤            ├→ G → H → output
//         └→ D → E → F ┘
stages: [
  [
    ['pkg.A', 'pkg.B', 'pkg.C'],
    ['pkg.D', 'pkg.E', 'pkg.F']
  ],
  'pkg.G',
  'pkg.H'
]
```

In [Chupim Web](https://github.com/baliberdin/chupim-web) you can draw these
arrangements as a graph instead of writing them.

## Circuit breaker
Stages that call other systems can fail or take too long. The circuit breaker
limits how long a stage can run and decides what happens when it times out or
throws an error:

- **Throw the error** (`action: 0`): the pipeline fails. Use it for stages the
  result cannot do without.
- **Run a fallback stage** (`action: 1`): another stage runs in place of the
  one that failed, and the pipeline goes on. Use it for optional stages.

```javascript
// Fallback that leaves the context as it is
chupim.registerStage({
  prefix: 'Fallback',
  name: 'returnContext',
  fn: async (context) => context
});

chupim.registerStage({
  prefix: 'news',
  name: 'fetchHeadlines',
  fn: async (context) => {
    const response = await fetch('https://news.example.com/headlines');
    context.headlines = await response.json();
    return context;
  },
  circuitbreaker: {
    enabled: true,
    timeout: 200,                // milliseconds, 1000 by default
    action: 1,                   // 0: throw the error, 1: run the fallback stage
    fn: 'Fallback.returnContext' // fallback stage, registered before this one
  }
});
```

The fallback receives the context and the error. With a fallback, the stage
works on a copy of the context, so the changes of a stage that fails or times
out are discarded. Timeouts are counted as circuit breaks in the metrics, and
errors are logged under the stage name.

## Errors and metrics
Chupim keeps an in-memory log of errors and metrics for every stage and
pipeline:

```javascript
// Errors thrown by a stage, by its prefix.name
chupim.errors.filteredByKey('news.fetchHeadlines');

// Requests, errors, circuit breaks and response times per minute
chupim.metrics.getData('news.fetchHeadlines');

// Keeps only the last 30 minutes of metrics, cleaning up every 5 seconds
chupim.metrics.startDataUpdater();
```

The error log keeps the last 10,000 errors. Set the `MAX_LOGS_LINES`
environment variable to change this limit.

## TypeScript
Chupim is written in TypeScript and ships its type definitions.

```typescript
import * as chupim from 'chupim';
import type { Context } from 'chupim';

chupim.registerStage({
  prefix: 'text',
  name: 'lowercase',
  fn: async (context: Context) => {
    context.text = context.text.toLowerCase();
    return context;
  }
});
```

## Development
The Node.js version is pinned in `.tool-versions` (asdf).

```shell
make install    # install dependencies (npm ci)
make test       # type check and run the tests (Vitest)
make build      # compile src/ to dist/
```

To release a new version, bump it and push the tag. The
[Publish](.github/workflows/publish.yml) workflow tests, builds and publishes
the package to npm:

```shell
npm version minor        # or major / patch: updates package.json and creates the tag
git push --follow-tags
```

## License
[Apache 2.0](LICENSE.txt)
