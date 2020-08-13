const Database = require('./database')
const database = new Database()

class Filter {
	constructor(){  }

	addFilter = (groupID, key, value, type='member') => {
		return new Promise(function(resolve, reject){
			database.setDocument(
				`groups/${groupID}/filters/${type}`,
				{[key.toLowerCase()]: value}
			).then(() => {
				resolve();
			}).catch((err) => {
				reject(err)
			})
		});
	}

	getFilterList = (groupID, type='member') => {
		return new Promise(function(resolve, reject){
			database.getDocument(`groups/${groupID}/filters/${type}`)
				.then((data) => {
					resolve(data);
				}).catch((err) => {
					reject(err)
				});
		}) 
	}

	getFilter = (groupID, key, type='member') => {
		var that = this
		return new Promise(function(resolve, reject){
			that.getFilterList(groupID, type).then((data) => {
				resolve(data[key])
			}).catch((err) => {
				reject(err);
			});
		})
	}

}

module.exports = Filter