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


const errors = {
  maxLogLines: (process.env['MAX_LOGS_LINES'] || 10000)*1,
  errorsLog: [],

  loggedKeys: function() {
    let keys = [];
    this.errorsLog.forEach( e => {
      if(e.key && !keys.includes(e.key)){
        keys.push(e.key);
      }
    });

    return keys;
  },

  filteredByKey: function(key){
    return this.errorsLog.filter(e => e.key == key);
  },

  _addErrorLog: function(error){
    if(this.errorsLog.length >= this.maxLogLines){
      this.errorsLog.shift();
    }
    this.errorsLog.push(error);
  },

  addStageError: function(stage, e){
    let error = {};
    if(e.constructor === TypeError){
      error = {
        name:error.name,
        message:error.message, 
        filename:error.filename,
        column:error.columnNumber, 
        stack:error.stack};
    }else{
      error = e;
    }

    this._addErrorLog({key:stage.key(), error:error, date:new Date()});
  },

  addError: function(key, e){
    let error = {};
    if(e.constructor === TypeError){
      error = {
        name:error.name,
        message:error.message, 
        filename:error.filename,
        column:error.columnNumber, 
        stack:error.stack};
    }else{
      error = e;
    }

    this._addErrorLog({key:key, error:error, date:new Date()});
  }
}

module.exports = errors;