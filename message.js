const axios = require('axios');

class Message {
	constructor(){
		this._token = '<Telegram API_Token>'
	}

	get token(){
		return this._token;
	}

	set token(token){
		this._token = token
	}

	bot_url = () => {
		return `https://api.telegram.org/bot${this.token}`
	}

	_message = (message, action) => {
		var that = this
		return new Promise(function(resolve, reject){
			axios.post(
				that.bot_url() + action,
				message
			).then((response) => {
				resolve(response)
			}).catch((err) => {
				reject(err)
			})
		})
	}

	sendMessage = (message) => {
		var that = this
		return new Promise(function(resolve, reject){
			that._message(message, '/sendMessage').then((response) => {
				resolve(response)
			}).catch((err) => {
				reject(err)
			})
		})
	}

	editMessage = (message) => {
		var that = this
		return new Promise(function(resolve, reject){
			that._message(message, '/editMessageText').then((response) => {
				resolve(response)
			}).catch((err) => {
				reject(err)
			})
		})
	}

	deleteMessage = (message, currentTime, miliseconds=10000) => {
		while (currentTime + miliseconds >= new Date().getTime());

		this._message(message, '/deleteMessage').then((response) => {
			console.log('Deleted', message)
		}).catch(err => {
			console.log(err)
		})
	}

	getChatMember = (chat_id, user_id) => {
		var that = this
		return new Promise(function(resolve, reject){
			that._message({chat_id, user_id}, '/getChatMember').then(response => {
				if(response.data.ok){
					resolve(response.data.result)
				}else{
					console.log(response)
					reject(new Error('Data Not OK'))
				}
			}).catch(err => {
				reject(err)
			})
		})
	}

	async getUsername(groupID, ids){
		try{
			var players = {}
			for (const id of ids){
				const result = await this.getChatMember(groupID, id)
				if(result.user.username){
					players[result.user.id] = result.user.username
				}else{
					var name = ''
					if(result.user.first_name) name += result.user.first_name
					if(result.user.last_name) name += ' ' + result.user.last_name
					players[result.user.id] = name
				}
			}
			return players;
		}catch(err){
			throw err
		}
	}

	getStatus = (chat_id, user_id) => {
		var that = this
		return new Promise(function(resolve, reject){
			that.getChatMember(chat_id, user_id).then(result => {
				console.log(result.status)
				resolve(result.status)
			}).catch(err => {
				reject(err)
			})
		})
	}

	isAdmin = (chat_id, user_id) => {
		var that = this
		return new Promise(function(resolve, reject){
			that.getStatus(chat_id, user_id).then(status => {
				resolve(status == 'administrator')
			}).catch(err => {
				reject(err)
			})
		})
	}

	isMember = (chat_id, user_id) => {
		var that = this
		return new Promise(function(resolve, reject){
			that.getStatus(chat_id, user_id).then(status => {
				resolve(status == 'member')
			}).catch(err => {
				reject(err)
			})
		})
	}

	isCreator = (chat_id, user_id) => {
		var that = this
		return new Promise(function(resolve, reject){
			that.getStatus(chat_id, user_id).then(status => {
				resolve(status == 'creator')
			}).catch(err => {
				reject(err)
			})
		})
	}



}

module.exports = Message
