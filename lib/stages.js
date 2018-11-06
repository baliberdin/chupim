const stage = {

	register: function(prefix, name, source) {
		
		if(prefix == undefined || name == undefined) throw new Error('Invalid prefix or stage name.');

		if(this[prefix] == undefined){
			this[prefix] = {};
		}

		if(source != undefined && source.constructor != undefined && source.constructor.name == 'AsyncFunction'){
			this[prefix][name] = {prefix:prefix, name:name, fn:source, source:source.toString()};
		}else{
			throw new Error('Invalid Stage Async Function.');
		}
	},

	join: {
		defaultJoin: (context, values) => {
			values.map(v => Object.assign(context,v));
			return context;
		}
	}
}

module.exports = stage;
