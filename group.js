const Database = require('./database')
const database = new Database()

class Group {
	constructor(){ 	}

	getOwner = () => {
		return new Promise(function(resolve, reject) {
			database.getFieldValue('about/creator', 'telegramId').then(data => resolve(data))
			.catch(err => reject(err))
		})
	}

	isOwner = (memberId) => {
		return new Promise(function(resolve, reject) {
			database.getFieldValue('about/owners', memberId)
				.then(data => {
					resolve(data)
				}).catch(err => {
					reject('Not an owner')
				})
		})
	}

	enableOwner = (memberId, enable=true) => {
		return new Promise(function(resolve, reject){
			database.setDocument(
				`about/owners`,
				{[memberId]: enable}
			).then(() => {
				resolve()
			}).catch(err => {
				reject(err)
			})
		})
	}


	removeOwner = (memberId) => {
		return new Promise(function(resolve, reject){
			database.deleteField(`about/owners`, memberId).then(() => {
				resolve()
			}).catch(err => {
				reject(err)
			})
		})
	}

	getGroups = () => {
		return new Promise(function(resolve, reject){
			database.getDocument(`settings/allowedGroups`)
				.then((data) => {
					resolve(data)
				}).catch(err => {
					reject(err)
				})

		})
	}

	getAllowedGroups = () => {
		const that = this
		return new Promise(function(resolve, reject){
			that.getGroups()
				.then(groups => {
					var allowedGroups = []
					for(let key in groups){
						if(groups[key]){
							allowedGroups.push(key)
						}
					}
					resolve(allowedGroups)
				}).catch(err => reject(err))
		})
	}

	isAllowedGroup = (groupID) => {
		return new Promise(function(resolve, reject){
			database.getFieldValue(`settings/allowedGroups`, groupID)
				.then(data => {
					resolve(data)
				}).catch(err => {
					reject('Group is not alloweded')
				})
		})
	}

	enableGroup = (groupID, enable=true) => {
		return new Promise(function(resolve, reject){
			database.setDocument(
				`settings/allowedGroups`,
				{[groupID]: enable}
			).then(() => {
				resolve()
			}).catch(err => {
				reject(err)
			})
		})
	}

	removeGroup = (groupID) => {
		return new Promise(function(resolve, reject){
			database.deleteField(`settings/allowedGroups`, groupID).then(() => {
				resolve()
			}).catch(err => {
				reject(err)
			})
		})
	}
}

module.exports = Group