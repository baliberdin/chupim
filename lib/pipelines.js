const metrics = require('./metrics');

const stageWrapper = async (context, stagePrefix, stageName, fn) => {
	if(stageName == undefined || stageName == null || stageName.trim() == ""){
		return await fn(context);
	}

	var elapsedTime = new Date();
	var result;
	var error;

	try {
		result = await fn(context);
	}catch(e){
		error = e.toString();
		result = context;
		metrics.addError(stagePrefix+"."+stageName);
		elapsedTime = new Date() - elapsedTime;
		metrics.addMetric(stagePrefix+"."+stageName, elapsedTime);
		throw e
	}

	elapsedTime = new Date() - elapsedTime;
	metrics.addMetric(stagePrefix+"."+stageName, elapsedTime);
  
	if(context._chupim_.metadata.stages_info[stageName] == undefined){
		var stageMetadata = {
      name:stageName, 
      prefix:stagePrefix, 
      elapsedTime: elapsedTime, 
      execution_indx:context._chupim_.metadata.executed_stages++
    };

		if(error != undefined){
			stageMetadata.error = error;
		}

		context._chupim_.metadata.stages_info.push(stageMetadata);
	}
	
	if(result == undefined){
		console.log(`[WARN] Stage [${stageName}] returned invalid context!`);
		result = context;
	}
	
	return result;
};

const pipeline = {
	serialPipeline: async (context, ...stages) => {
		var i=0;
		if(stages.length == 1){
			return stageWrapper(context,stages[0].prefix, stages[0].name, stages[0].fn);
		}

    var fn = stages.length == 0? context: stages
      .reduce( (f1,f2) => {
        if(f1.constructor.name == 'Object'){
          return async (q) => stageWrapper(q,f1.prefix, f1.name,f1.fn)
            .then(r => stageWrapper(r,f2.prefix, f2.name, f2.fn));	
        }else{
          return async (q) => f1(q)
            .then(r => stageWrapper(r,f2.prefix, f2.name, f2.fn));
        }
      });
      
		return fn(context);
	},

	parallelPipeline: async (context, joinFunction, ...pipelines) => {
		if(pipelines.length == 0){
			return joinFunction(context);
		}else{
			let parsedQueries = [];
			let pipelinesResults = pipelines.map( pipeline => {
				return pipeline(context).then( parsedQuery => parsedQueries.push(parsedQuery) );
			});	

			await Promise.all(pipelinesResults);
			return joinFunction(context, parsedQueries);
		}
	}
}

module.exports = pipeline;