const utils = require('./helper/index')
const bot = require('./bot')

class Cristro{
	constructor(message){
		this.message = message
	}

	start = () => {
		try{
			const that = this
			if(!this.message){

			}else if(!this.message.text){

			}else{		
				this.text = this.message.text

				if(this.text.startsWith('/')){
					that.getCommandParas()
					bot.group.isOwner(this.message.from.id)
						.then(isOwner => {
							try{
								if(isOwner){
									that.isCommandCorrect()
									that.executeCommand()
								}
							}catch(err) {
								that.sendMessage(err.message, undefined, false)
							}
						})
				}
			}
		}catch(err){
			console.log(err)
			this.sendMessage(err.message, undefined, false)
		}
	}

	sendMessage = (text, reply_to_message_id=true, delete_message=true, milliseconds = 3000) =>{
		var data
		if(text.chat_id){
			data = text
		}else{
			data = { chat_id: this.message.chat.id, text }
			if(reply_to_message_id) data['reply_to_message_id'] = this.message.message_id
		}
		bot.message.sendMessage(data).then(response => {
			if(delete_message && response.data && response.data.ok && response.data.result.message_id){
				bot.message.deleteMessage({chat_id: this.message.chat.id, message_id: this.message.message_id}, new Date().getTime(), 0)
				bot.message.deleteMessage({chat_id: response.data.result.chat.id, message_id: response.data.result.message_id}, new Date().getTime(), milliseconds)
			}
		}).catch(err => {
			console.log(err)
			bot.message.deleteMessage({chat_id: this.message.chat.id, message_id: this.message.message_id}, new Date().getTime(), 0)
		})
		// if (delete_message)
		// 	bot.message.deleteMessage({chat_id: this.message.chat.id, message_id: this.message.message_id})
	}

	getCommandParas = () => {
		var [command, paras]  = utils.Text.extract(this.text)
		this.command = command.replace('@CristroBot', '')
		this.paras = paras.trim()
		console.log('command and paras', '[' + this.command,'],[' + this.paras + ']')
	}

	isReply = () => {
		if(this.message.reply_to_message) return true
		return false
	}

	hasParas = () => {
		if(this.paras && this.paras != '')
			return true
		return false
	}

	isCommandCorrect = () => {
		if(['/help'].includes(this.command)){
			return true;
		}

		if(['/enable_owner', '/prevent_owner'].includes(this.command)){
			if(!this.isReply()) throw new Error('Must be reply')
			return true
		}

		if([].includes(this.command)){
			if(!this.hasParas()) throw new Error(`Command Not in proper format`)
			return true
		}


		if([].includes(this.command)){
			if(!this.isReply()) throw new Error('Must be reply')
			else if(!this.hasParas()) throw new Error(`Command Not in proper format`)
			return true
		}
		throw new Error('No command found')
	}


	executeCommand = () =>{
		const that = this
		switch(that.command){
			case '/help': {
				that.sendMessage('/enable_owner\n/prevent_owner\n', undefined, false)
				return true
			}
			case '/enable_owner': {
				bot.group.enableOwner(that.message.reply_to_message.forward_from.id)
					.then(() => that.sendMessage(that.message.reply_to_message.forward_from.first_name + ' is now owner', undefined, false))
					.catch(err => {
						console.log(err)
						that.sendMessage(err.message, undefined, false)
					})
				return true;
			}
			case '/prevent_owner': {
				bot.group.enableOwner(that.message.reply_to_message.forward_from.id, false)
					.then(() => that.sendMessage(that.message.reply_to_message.forward_from.first_name + ' is now prevented to became an owner', undefined, false))
					.catch(err => {
						console.log(err)
						that.sendMessage(err.message, undefined, false)
					})
				return true;
			}
		}
		throw new Error('Command Defination not found')
	}
}

module.exports = Cristro