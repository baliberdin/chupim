/*
   Copyright 2019 Allan Mendes Silva Baliberdin

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.

*/

export interface StageInfo {
  name: string;
  prefix: string;
  elapsedTime: number;
  execution_indx: number;
  error?: string;
}

export interface ChupimMetadata {
  params: {
    debug: boolean;
    [key: string]: unknown;
  };
  metadata: {
    stages_info: StageInfo[];
    executed_stages: number;
    totalTime?: number;
  };
}

// Context has no fixed schema: stages can put almost anything into it.
export interface Context {
  _chupim_: ChupimMetadata;
  [key: string]: any;
}

export type StageFunction = (context: Context) => Promise<any>;
export type FallbackFunction = (context: Context, error: unknown) => Promise<any>;
export type PipelineFunction = (context: any) => Promise<any>;
export type JoinFunction = (values: any[]) => any;

// 0 - Throw Error, 1 - Fallback Function
export type CircuitBreakerAction = 0 | 1;

export interface CircuitBreakerConfig {
  enabled: boolean;
  timeout?: number;
  action: CircuitBreakerAction;
  // Fallback stage name (prefix.name). Required when action is 1.
  fn?: string;
}

export interface StageDefinition {
  prefix: string;
  name: string;
  fn: StageFunction;
  circuitbreaker?: CircuitBreakerConfig;
}

export interface Stage extends StageDefinition {
  source: string;
  key: () => string;
}

/*
  Stage arrangement. Strings are stage names (prefix.name) executed in serial.
  A nested matrix is a set of serial pipelines executed in parallel.
  e.g: ['p.a', [['p.b', 'p.c'], ['p.d']], 'p.e']
*/
export type StageList = Array<string | StageList[]>;

export interface ComponentConfig {
  id: string;
  name?: string;
  stages: StageList;
  methods?: unknown[];
  enabled?: boolean;
}

export interface SerialPipelineObject {
  type: 'serial';
  pipeline: PipelineFunction;
  names: string[];
}

export interface ParallelPipelineObject {
  type: 'parallel';
  pipelines: PipelineObject[];
}

export interface GroupPipelineObject {
  type: 'group';
  pipelines: PipelineObject[];
}

export type PipelineObject = SerialPipelineObject | ParallelPipelineObject | GroupPipelineObject;

export interface GraphNode {
  data: {
    id: string;
    label: string;
    type: string;
    configName?: string;
  };
}

export interface GraphEdge {
  data: {
    source: string;
    target: string;
  };
}

export interface GraphElements {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface Component {
  id: string;
  name?: string;
  fn: (context: Context) => Promise<any>;
  elements: GraphElements;
  methods: unknown[];
  enabled: boolean;
}

export interface Metric {
  errors: number;
  requests: number;
  circuit_breaks: number;
  totalTime: number;
  avgTime: number;
}

export interface MetricsData {
  // time key (yyyy-MM-ddTHH:mm:00) -> metric name -> metric
  series: Record<string, Record<string, Metric>>;
}

export interface ErrorLogEntry {
  key: string;
  error: unknown;
  date: Date;
}
