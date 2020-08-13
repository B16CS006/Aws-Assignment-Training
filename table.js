const Database = require('./database')
const database = new Database()

const Message = require('./message')
const message = new Message()

class Table {
	constructor(){ 	}

	tax = (money) => {
		money = parseInt(money)
		if(money <= 70) return 5
		if(money <= 100) return 10
		if(money <= 150) return 15
		if(money <= 200) return 20
		if(money <= 300) return 30
		if(money <= 400) return 40
		if(money <= 500) return 50
		if(money <= 750) return 75
		if(money <= 1000) return 100
		if(money <= 1500) return 150
		if(money <= 2000) return 200
		if(money <= 2500) return 250
		if(money <= 5000) return 500
		if(money <= 7500) return 750
		if(money <= 10000) return 1000
		return 1000;
	}

	message_id
	message_id

	showTableMessge = (groupID, table, ids, data, winner = null) => {
		return new Promise(function(resolve, reject){
			message.getUsername(groupID, ids).then(players => {
				var text = `Table: ${table}\n`
				var isFirst = true
				for(const id in players){
					if(isFirst){
						isFirst = false
						text += `\n\t[${players[id]}](tg://user?id=${id})`
					}else{
						text += '\n\n\t\t🇻 🇸\n'
						text += `\n\t[${players[id]}](tg://user?id=${id})`
					}
					if(winner !== null){
						if(winner == id){
							text += '  ✔️'
						}else if(winner !== null){
							text += '  ❌'
						}
					}
				}
				text += `\n\n${data['money']} full`
				var messageData = {
					chat_id: groupID,
					text,
					parse_mode: 'Markdown'
				}
				if(winner !== null){
					if(data['message_id']){
						messageData['message_id'] = data['message_id']
					}else{
						reject('Winner is not provided')
					}
				}
				resolve(messageData)
			}).catch(err => {
				reject(err)
			})
		})
	}

	setTable = (groupID, table, memberID, money=null) => {
		var data = {
			[memberID]: 'player'
		}

		if(money){
			data['money'] = money
		}

		return new Promise(function(resolve, reject){
			database.getDatabase().runTransaction(t => {
				return t.get(database.getReference(`groups/${groupID}/payment/${memberID}`))
					.then(doc => {
						if(!doc.exists || !('money' in doc.data())){
							t.update(database.getReference(`groups/${groupID}/payment/${memberID}`), {money: 0}, {merge: true});
						}
						t.update(database.getReference(`groups/${groupID}/table/${table}`), data, {merge: true});
					})
			}).then(result => {
				resolve(result)
			}).catch(err => {
				reject(err)
			})
		})
	}


	showTable = (groupID, table) => {
		var that = this
		return new Promise(function(resolve, reject){
			database.getDocument(`groups/${groupID}/table/${table}`).then(data => {
				var ids = []
				for (const key in data) if(data[key] == 'player') ids.push(key)
				that.showTableMessge(groupID, table, ids, data).then(messageData => {
					message.sendMessage(messageData).then(response =>{
						if(response.data && response.data.ok && response.data.result.message_id){
							database.setDocument(`groups/${groupID}/table/${table}`, {message_id: response.data.result.message_id}).then(() => {
								resolve()
							}).catch(err => {
								reject(err)
							})
						}
					}).catch(err => {
						reject(err)
					})
				}).catch(err => {
					reject(err)
				})
			}).catch(err => {
				reject(err)
			})
		})
	}

	cancelTable = (groupID, table) => {
		return new Promise(function(resolve, reject) {
			database.deleteDocument(`groups/${groupID}/table/${table}`)
			.then(() => {
				resolve()
			}).catch(err => {
				reject(err)
			})	
		})
	}

	cancelAllTables = (groupID) => {
		return new Promise(function(resolve, reject){
			database.deleteCollection(`groups/${groupID}/table`).then(() => {
				resolve()
			}).catch(err => {
				reject(err)
			})
		})
	}

	async allTables(groupID){
		try{
			var tables = await this.getTables(groupID)
			var text = '\tList of All the Tables:\n'
			for(const table in tables){
				var money = 0
				text += `\n\n${table}(${tables[table]['money']}) => `
				var ids = []
				for(const key in tables[table]) if(tables[table][key] == 'player') ids.push(key)
				const players = await message.getUsername(groupID, ids)
				var isFirst = true
				for(const id in players){
					if(isFirst){
						isFirst = false
						text += `[${players[id]}](tg://user?id=${id})`
					}else{
						text += `, [${players[id]}](tg://user?id=${id})`
					}
				}
			}
			text += `\n\tEnd`
			var messageData = {
				chat_id: groupID,
				text,
				parse_mode: 'Markdown'
			}
			return messageData
		}catch(err){
			throw err
		}
	}

	getTables = (groupID) => {
		return new Promise(function(resolve, reject){
			database.getCollection(`groups/${groupID}/table`).then(snapshot => {
				const tables = {}
				snapshot.forEach(doc => {
					tables[doc.id] = doc.data()
				})
				resolve(tables)
			}).catch(err => {
				reject(err)
			})
		})
	}

	win = (groupID, table, memberID) => {
		var that = this
		return new Promise(function(resolve, reject){
			database.getDocument(`groups/${groupID}/table/${table}`).then((data) => {
				const money = parseInt(data['money'])
				const tax = parseInt(that.tax(money))
				const items = []
				const ids = []
				for(const key in data){
					if(data[key] === 'player'){
						ids.push(key)
						if(key == memberID){
							console.log(key, money - tax, memberID)
							items.push({ref: database.getReference(`groups/${groupID}/payment/${key}`), data:{money: database.getIncrement(money - tax)}, action: 'update'})
						}else{
							console.log(key, -money, memberID)
							items.push({ref: database.getReference(`groups/${groupID}/payment/${key}`), data:{money: database.getIncrement(-money)}, action: 'update'})	
						}
					}
				}
				items.push({ref: database.getReference(`groups/${groupID}/info/profit`), data:{total: database.getIncrement(tax)}, action: 'update'})
				items.push({ref: database.getReference(`groups/${groupID}/table/${table}`), data: undefined, action: 'delete'})
				database.executeBatch(items).then(() => {
					that.showTableMessge(groupID, table, ids, data, memberID).then(messageData => {
						console.log(messageData)
						message.editMessage(messageData).then(response =>{
							resolve('Done')
						}).catch(err => {
							console.log(err)
							resolve('Balance is upadted but unable to edit message')
						})
					}).catch(err => {
						console.log(err)
						resolve('Balance is updated but unable to edit message')
					})
				}).catch(err => {reject(err)})
			}).catch((err) => {
				reject(err)
			});
		})
	}
}

module.exports = Table