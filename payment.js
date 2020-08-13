const Database = require('./database')
const database = new Database()

const Message = require('./message')
const message = new Message()

class Payment {
	constructor(){ 	}

	getPayment = (groupID, memberID) => {
		return new Promise(function(resolve, reject){
			database.getDocument(`groups/${groupID}/payment/${memberID}`)
				.then((data) => {
					if(data['money']){
						resolve(data['money'])
					}else{
						resolve(0)
					}
				}).catch(err => {
					if(err.message == 'No such document exists') resolve(0)
					else reject(err)
				})

		})
	}

	setPayment = (groupID, memberID, money) => {
		money = parseInt(money)
		return new Promise(function(resolve, reject){
			database.setDocument(
				`groups/${groupID}/payment/${memberID}`,
				{money}
			).then(() => {
				resolve()
			}).catch(err => {
				reject(err)
			})
		})
	}

	addPayment = (groupID, memberID, value) => {
		return new Promise(function(resolve, reject){
			database.increment(`groups/${groupID}/payment/${memberID}`, 'money', value)
				.then(() => {
					resolve()
				}).catch(err => {
					reject(err)
				})
		})
	}

	async getPayments(groupID){

		try{
			const snapshot = await database.getCollection(`groups/${groupID}/payment`)
			
			const payments = []
			var ids = []

			snapshot.forEach(doc => {
				payments.push({id: doc.id, data: doc.data()['money']})
				ids.push(doc.id)
			})
			const players = await message.getUsername(groupID, ids)
			payments.sort(function(a,b){return players[a.id].localeCompare(players[b.id]) })
			var text = '\tPayment List of the Members:\n'
			for(const payment of payments){
				text += `\n[${players[payment.id]}](tg://user?id=${payment.id}) => ${payment.data}`
			}
			text += '\n\n\tThank You for playing in our Groups.\n\nFor Rules checkout group description.'
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

	async updatePaymentMessage(groupID, messageID=null){
		try{
			console.log(messageID)
			var messageData = await this.getPayments(groupID)
			console.log(messageData)
			if(messageID){
				if(messageID == 'new'){
					var response = await message.sendMessage(messageData)
					if(response.data && response.data.ok && response.data.result.message_id){
						await database.setDocument(`groups/${groupID}/info/profit`, {['payment_message_id']: response.data.result.message_id})
					}
					return true;
				}else{
					messageData['message_id'] = messageID
				}
			}else{
				var profit = await database.getDocument(`groups/${groupID}/info/profit`)
				messageID = profit['payment_message_id']
				if(messageID){
					messageData['message_id'] = messageID
				}else{
					var response = await message.sendMessage(messageData)
					if(response.data && response.data.ok && response.data.result.message_id){
						await database.setDocument(`groups/${groupID}/info/profit`, {['payment_message_id']: response.data.result.message_id})
					}
					return true;
				}
			}
			return new Promise(function(resolve, reject){
				message.editMessage(messageData).then(() => {
					resolve(true)
				}).catch(err => {
					if(err.response.status == 400 &&
						err.response.data.description == 'Bad Request: message is not modified: specified new message content and reply markup are exactly the same as a current content and reply markup of the message'
					){
						resolve(true)
					}else{
						reject(err)
					}
				})
			})
		}catch(err){
			throw err
		}
	}
}

module.exports = Payment