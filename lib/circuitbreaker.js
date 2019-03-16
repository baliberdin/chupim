const metrics = require('./metrics');

module.exports = {

  timedFunction: function(serviceName, fn, timeout){
    return async context => {
      return new Promise((resolve, reject) => {
        var timeLimit = timeout || 1000;
        let rejected = false;
        let resolved = false;

        setTimeout(
          () => {
            if(!resolved){
              rejected = true;
              metrics.addCircuitBreak(serviceName);
              reject(new Error(`Timeout on: ${serviceName}.`))
            }
          },
          timeLimit
        );
        fn(context)
          .then(r => {
            if(!rejected){
              resolved = true;
              resolve(r);
            }
          })
          .catch(e => reject(e));
      });
    };
  },

  timedFallback: function(serviceName, fn, fallbackFunction, timeout){
    return async context => {
      return new Promise((resolve, reject) => {
        var timeLimit = timeout || 1000;
        let rejected = false;
        let resolved = false;

        setTimeout(
          () => {
            if(!resolved){
              rejected = true;
              metrics.addCircuitBreak(serviceName);
              reject(new Error(`Timeout on: ${serviceName}.`));
            }
          },
          timeLimit
        );

        fn(Object.create(context))
          .then(r => {
            if(!rejected){
              resolved = true;
              resolve(Object.assign(context,r));
            }
          })
          .catch(e => reject(e));
      }).catch( e => {
        return fallbackFunction(context, e);
      });
    };
  },
};