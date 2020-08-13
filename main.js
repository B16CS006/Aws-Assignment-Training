const utils = require('./helper/index')
const bot = require('./bot')

class Main{
	constructor(message){
		// bot.info.getCreatorInfo()
		this.message = message
		this.chat_id = message.chat.id
		this.text = null
		this.memberCommand = []
		this.creatorCommand = ['/reset_profit']
		this.ownerCommand = ['/activate', '/deactivate']
		// this.start()
	}

	start = () => {
		try{
			if(!this.message){

			}else if(!this.message.text){

			}else{		
				this.text = this.message.text

				if(this.text.startsWith('/')){
					this.getCommandParas()
					var that = this
					this.isCommandAvailable().then(() => {
						try{
							that.isCommandCorrect()
							that.executeCommand()
						}catch(err){
							console.log('Error Inner Try Catch: ', err)
							that.sendMessage(err.message)
						}
					}).catch(err => {
						console.log('Error Outer then Catch: ', err)
						// that.sendMessage(err.message) // To send warning
					})
				}
			}
		}catch(err){
			console.log(err)
			this.sendMessage('Something went wrong')
		}
	}

	async isCommandAvailable(){
		try{
			if(this.ownerCommand.includes(this.command)){
				const  isOwner = await bot.group.isOwner(this.message.from.id);
				if(isOwner){
					return true
				}else{
					throw new Error('Only For Owners')
				}
			}

			const isAllowedGroup = await bot.group.isAllowedGroup(this.message.chat.id);
			if(!isAllowedGroup){
				throw new Error('Group Not Allowed')
			}

			const status = await bot.message.getStatus(this.chat_id, this.message.from.id);
			if(status === 'member'){
				if(this.memberCommand.includes(this.command)){
					return true
				}else{
					throw new Error('Not for Members')
				}
			}else if (status === 'administrator'){
				if(this.creatorCommand.includes(this.command)){
					throw new Error('Only for Creator')
				}else{
					return true
				}
			}else if (status === 'creator'){
				return true
			}else{
				throw new Error('Not for outsiders')
			}
		}catch(err){
			throw err
		}
	}

	isCommandCorrect = () => {
		if(['/start', '/filter', '/payment', '/get_profit', '/all_tables', '/cancel_all_tables', '/reset_profit', '/update_payment', '/activate', '/deactivate'].includes(this.command)){
			return true;
		}

		if(['/check_payment'].includes(this.command)){
			if(!this.isReply()) throw new Error('Must be reply')
			return true
		}

		if(['/new_filter', '/show_table', '/cancel_table'].includes(this.command)){
			if(!this.hasParas()) throw new Error(`Command Not in proper format`)
			return true
		}


		if(['/set_payment', '/add_payment', '/set_table', '/win'].includes(this.command)){
			if(!this.isReply()) throw new Error('Must be reply')
			else if(!this.hasParas()) throw new Error(`Command Not in proper format`)
			return true
		}
		throw new Error('No command found')
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

	getCommandParas = () => {
		var [command, paras]  = utils.Text.extract(this.text)
		this.command = command.replace('@CristroBot', '')
		this.paras = paras.trim()
		console.log('command and paras', '[' + this.command,'],[' + this.paras + ']')
	}

	sendMessage = (text, reply_to_message_id=true, delete_message=true, milliseconds = 3000) =>{
		var data
		if(text.chat_id){
			data = text
		}else{
			data = { chat_id: this.chat_id, text }
			if(reply_to_message_id) data['reply_to_message_id'] = this.message.message_id
		}
		bot.message.sendMessage(data).then(response => {
			if(delete_message && response.data && response.data.ok && response.data.result.message_id){
				bot.message.deleteMessage({chat_id: this.chat_id, message_id: this.message.message_id}, new Date().getTime(), 0)
				bot.message.deleteMessage({chat_id: response.data.result.chat.id, message_id: response.data.result.message_id}, new Date().getTime(), milliseconds)
			}
		}).catch(err => {
			console.log(err)
			bot.message.deleteMessage({chat_id: this.chat_id, message_id: this.message.message_id}, new Date().getTime(), 0)
		})
		// if (delete_message)
		// 	bot.message.deleteMessage({chat_id: this.chat_id, message_id: this.message.message_id})
	}

	throwError = (err) => {
		this.sendMessage(err.message)
	}

	executeCommand = () =>{
		switch(this.command){
			case '/start':{
				this.sendMessage('Ok, not a problem')
				return true;
			}
			case '/filter': {
				bot.filter.getFilterList(this.chat_id).then((data) => {
			    	this.sendMessage(Object.keys(data).join('\n'))    		
		    	}).catch((err) => {
		    		this.throwError(err)
		    	})
		    	return true;
			}
			case '/payment':{
				bot.payment.getPayment(this.chat_id, this.message.from.id).then((money) => {
					this.sendMessage('Your Current Balance is ' + money + '.', 1000)
				}).catch((err) => {
					this.throwError(err)
				})
				return true;
			}
			case '/get_profit': {
				bot.info.getProfit(this.chat_id).then((profit) => {
					this.sendMessage('Total Profit is :' + profit)
				}).catch(err => {
					this.throwError(err)
				})
				return true;
			}
			case '/all_tables': {
				bot.table.allTables(this.chat_id).then(messageData => {
					this.sendMessage(messageData)
				}).catch(err => {
					this.throwError(err)
				})
				return true
			}
			case '/cancel_all_tables': {
				bot.table.cancelAllTables(this.chat_id).then(messageData => {
					this.sendMessage(messageData)
				}).catch(err => {
					this.throwError(err)
				})
				return true
			}
			case '/check_payment':{
				bot.payment.getPayment(this.chat_id, this.message.reply_to_message.from.id).then((money) => {
					this.sendMessage(this.message.reply_to_message.from.first_name + '\'s current balance is ' + money + '.')
				}).catch((err) => {
					this.throwError(err)
				})
				return true;
			}
			case '/reset_profit': {
				var [value, _temp] = utils.Text.extract(this.paras)
				value = parseInt(value) || 0
				bot.info.resetProfit(this.chat_id, value).then(() => {
					this.sendMessage('Profit is reset')
				}).catch((err) => {
					this.throwError(err)
				})
				return true;
			}
			case '/new_filter': {
				var [key, value] = utils.Text.extract(this.paras)
		    	bot.filter.addFilter(this.chat_id, key, value).then(() => {
		    		this.sendMessage(`Filter successfully added for ${key} => ${value}`)
		    	}).catch((err) => {
		    		this.throwError(err)
		    	})
		    	return true;
			}
			case '/show_table': {
				var [table, _] = utils.Text.extract(this.paras)
				bot.table.showTable(this.chat_id, table).then(() => {
					bot.message.deleteMessage({chat_id: this.chat_id, message_id: this.message.message_id}, new Date().getTime(), 0)
				}).catch(err => {
					this.throwError(err)
				})
				return true;
			}
			case '/cancel_table': {
				var [table, _] = utils.Text.extract(this.paras)
				bot.table.cancelTable(this.chat_id, table).then(() => {
					this.sendMessage(`${table} is successfully cancelled.`)
				}).catch(err => {
					this.throwError(err)
				})
				return true;
			}		
			case '/set_payment': {
				var [money, value] = utils.Text.extract(this.paras)
				var money = parseInt(money)
				if(!Number.isInteger(money)) throw new Error('Balance is not provided')

				bot.payment.setPayment(
					this.chat_id,
					this.message.reply_to_message.from.id,
					money
				).then(() => {
					this.sendMessage(`Balance Updated successfully`)
				}).catch(err => {
					this.throwError(err)
				})
				return true
			}
			case '/add_payment':{
				var [money, value] = utils.Text.extract(this.paras)
				var money = parseInt(money)
				if(!Number.isInteger(money)) throw new Error('Balance is not provided')

				bot.payment.addPayment(
					this.chat_id,
					this.message.reply_to_message.from.id,
					money
				).then(() => {
					this.sendMessage(`Balance Updated successfully`)
				}).catch(err => {
					this.throwError(err)
				})
				return true
			}
			case '/set_table': {
				var [table, value] = utils.Text.extract(this.paras)
				table = table.toLowerCase()
				var money = parseInt(value) || null

				bot.table.setTable(
					this.chat_id,
					table,
					this.message.reply_to_message.from.id,
					money
				).then(() => {
					this.sendMessage(`${this.message.reply_to_message.from.first_name} added to table ${table}, with money ${money}`)
				}).catch(err => {
					this.throwError(err)
				})
				return true
			}
			case '/win': {
				var [table] = utils.Text.extract(this.paras)
				table = table.toLowerCase()

				bot.table.win(
					this.chat_id,
					table,
					this.message.reply_to_message.from.id
				).then(() => {
					this.sendMessage('Balance is updated successfully')
				}).catch((err) => {
					this.throwError(err)
				})
				return true
			}
			case '/update_payment': {
				var messageID = null
				var [value, _temp] = utils.Text.extract(this.paras)

				if(value == 'new') messageID = 'new'
				else if(this.message.reply_to_message) messageID = this.message.reply_to_message.message_id || null

				bot.payment.updatePaymentMessage(this.chat_id, messageID).then(() => {
					this.sendMessage('Messege is successfully updated.')
				}).catch(err => {
					this.throwError(err)
				})
				return true
			}
			case '/activate': {
				bot.group.enableGroup(this.chat_id).then(() => {
					this.sendMessage('Group is activated')
				}).catch(err => {
					this.throwError(err)
				})
				return true
			}

			case '/deactivate': {
				bot.group.enableGroup(this.chat_id, false).then(() => {
					this.sendMessage('Group is deactivated')
				}).catch(err => {
					this.throwError(err)
				})
				return true
			}
		}
		throw new Error('Command Defination not found')
	}
}

module.exports = Main