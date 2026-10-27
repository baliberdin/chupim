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


import type { ErrorLogEntry, Stage } from './types';

const errors = {
  maxLogLines: Number(process.env['MAX_LOGS_LINES'] || 10000),
  errorsLog: [] as ErrorLogEntry[],

  loggedKeys: function(): string[] {
    let keys: string[] = [];
    this.errorsLog.forEach( e => {
      if(e.key && !keys.includes(e.key)){
        keys.push(e.key);
      }
    });

    return keys;
  },

  filteredByKey: function(key: string): ErrorLogEntry[] {
    return this.errorsLog.filter(e => e.key == key);
  },

  _addErrorLog: function(error: ErrorLogEntry): void {
    if(this.errorsLog.length >= this.maxLogLines){
      this.errorsLog.shift();
    }
    this.errorsLog.push(error);
  },

  addStageError: function(stage: Stage, e: any): void {
    this.addError(stage.key(), e);
  },

  addError: function(key: string, e: any): void {
    let error: unknown = {};
    if(e.constructor === TypeError){
      error = {
        name:e.name,
        message:e.message, 
        filename:(e as any).filename,
        column:(e as any).columnNumber, 
        stack:e.stack};
    }else{
      error = e;
    }

    this._addErrorLog({key:key, error:error, date:new Date()});
  }
}

export default errors;
