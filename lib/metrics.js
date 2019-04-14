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

const metrics = {
    data: {
        series: {}
    },

    lastClean: new Date(),

    // type: 0 - Request Success, 1 - CircuitBreak, 2 - Error
    addHit: function(name, elapsedTime, type){
        this.prepareDate();

        let dtKey = this.getTimeKey();
        if(!this.data.series[dtKey][name]){
            let metric = {
                errors: type == 2 ? 1 : 0,
                requests: 1,
                circuit_breaks: type == 1 ? 1 : 0,
                totalTime: elapsedTime,
                avgTime: elapsedTime
            };

            this.data.series[dtKey][name] = metric;
        }else{
            let metric = this.data.series[dtKey][name];
            metric.requests++;

            if(type == 1){
                metric.circuit_breaks++;
            }

            if(type == 2){
                metric.errors++;
            }

            metric.totalTime += elapsedTime;
            metric.avgTime = metric.totalTime/metric.requests;
            this.data.series[dtKey][name] = metric;
        }
    },

    addCircuitBreak: function(name){
        this.prepareDate();

        let dtKey = this.getTimeKey();
        if(!this.data.series[dtKey][name]){
            let metric = {
                errors: 0,
                requests: 0,
                circuit_breaks: 1,
                totalTime: 0,
                avgTime: 0
            };

            this.data.series[dtKey][name] = metric;
        }else{
            let metric = this.data.series[dtKey][name];
            metric.circuit_breaks++;
            this.data.series[dtKey][name] = metric;
        }
    },

    addMetric: function(name, elapsedTime){
        this.prepareDate();

        let dtKey = this.getTimeKey();
        if(!this.data.series[dtKey][name]){
            let metric = {
                errors: 0,
                requests: 1,
                circuit_breaks: 0,
                totalTime: elapsedTime,
                avgTime: elapsedTime
            };

            this.data.series[dtKey][name] = metric;
        }else{
            let metric = this.data.series[dtKey][name];
            metric.requests++;
            metric.totalTime += elapsedTime;
            metric.avgTime = metric.totalTime/metric.requests;
            this.data.series[dtKey][name] = metric;
        }
    },

    addError: function(name){
        this.prepareDate();

        let dtKey = this.getTimeKey();
        if(!this.data.series[dtKey][name]){
            let metric = {
                errors: 1,
                requests: 0,
                circuit_breaks: 0,
                totalTime: 0,
                avgTime: 0
            };

            this.data.series[dtKey][name] = metric;
        }else{
            let metric = this.data.series[dtKey][name];
            metric.errors++;
            this.data.series[dtKey][name] = metric;
        }
    },

    getTimeKey: function(d){
        let dt = d || new Date();
        dt.setSeconds(0);
        dt.setMilliseconds(0);

        let year = dt.getFullYear();
        let month = dt.getMonth()+1;
        let day = dt.getDate();
        let hour = dt.getHours();
        let minute = dt.getMinutes();

        return `${year}-${month<10?"0"+month:month}-${day<10?"0"+day:day}T${hour<10?"0"+hour:hour}:${minute<10?"0"+minute:minute}:00`;
    },

    prepareDate: function(d){
        let txtDt = this.getTimeKey(d);
        if(!metrics.data.series[txtDt]) metrics.data.series[txtDt] = {};
    },

    getPast30Minutes: function(m){
        minutes = m || 30;
        var dt = new Date();
        dt.setMilliseconds(0);
        dt.setSeconds(0);
        return new Date(dt - (minutes*60*1000));
    },

    deletePast30Minutes: function(){
        var dt = metrics.getPast30Minutes();
        var dtKey = metrics.getTimeKey(dt);
        var dt = new Date(Date.parse(dtKey));

        Object.keys(metrics.data.series).map( t => {
            let time = new Date(Date.parse(t));
            if(time < dt){
                delete metrics.data.series[t];
            }
        });

        this.lastClean = new Date();
    },

    getRPM: function(id){
        return (Object.keys(this.data.series)
            .map(t => this.data.series[t][id]?this.data.series[t][id].requests:0)
            .reduce( (a,b) => a+b)/Object.keys(this.data.series).length).toFixed(2);
    },

    getErrors: function(id){
        return (Object.keys(this.data.series)
            .map(t => this.data.series[t][id]?this.data.series[t][id].errors:0)
            .reduce( (a,b) => a+b));
    },

    getErrorsPercent: function(id){
        var reqs = (Object.keys(this.data.series)
            .map(t => this.data.series[t][id]?this.data.series[t][id].requests:0)
            .reduce( (a,b) => a+b));

        var errors = (Object.keys(this.data.series)
            .map(t => this.data.series[t][id]?this.data.series[t][id].errors:0)
            .reduce( (a,b) => a+b));

        var percent = ((errors*100)/reqs);
        return isNaN(percent)?0:percent.toFixed(2);
    },

    getResponseTime: function(id){
        let totalTime = (Object.keys(this.data.series)
            .map(t => this.data.series[t][id]?this.data.series[t][id].totalTime:0)
            .reduce( (a,b) => a+b));
        
        let requests = (Object.keys(this.data.series)
            .map(t => this.data.series[t][id]?this.data.series[t][id].requests:0)
            .reduce( (a,b) => a+b));

        var responseTime = (totalTime / requests).toFixed(2);

        return isNaN(responseTime)?"N/A":responseTime+" ms";
    },

    getData: function(key){
        if(key){
            var filteredData = {series:{}};
            Object.keys(this.data.series).map( s => {
                filteredData.series[s] = {};
                if(this.data.series[s][key]){
                    filteredData.series[s][key] = this.data.series[s][key];
                }
            });

            return filteredData;

        }else{
            return this.data;
        }
    },

    startDataUpdater: function(){
        setInterval(function(){
            try{
                metrics.prepareDate();
                metrics.deletePast30Minutes();
            }catch(e){
                console.error(e);
            }
        }, 5000);
    }
}

for(var i=0;i<30;i++){
    var dt = metrics.getPast30Minutes(i);
    metrics.prepareDate(dt);
}

module.exports = metrics;