const metrics = {
    data: {
        series: {}
    },

    lastClean: new Date(),

    addMetric: function(name, elapsedTime){
        this.prepareDate();

        let dtKey = this.getTimeKey();
        if(!this.data.series[dtKey][name]){
            let metric = {
                errors: 0,
                requests: 1,
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
        return isNaN(percent)?'N/A':percent.toFixed(0)+'%';
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
            metrics.prepareDate();
            metrics.deletePast30Minutes();
        }, 5000);
    }
}

for(var i=0;i<30;i++){
    var dt = metrics.getPast30Minutes(i);
    metrics.prepareDate(dt);
}

module.exports = metrics;