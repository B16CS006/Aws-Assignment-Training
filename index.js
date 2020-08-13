const express = require('express')
const bodyParser = require('body-parser')

const port = process.env.PORT || 8443

const allowedGroups = [-1001397062652, -1001280426731, -1001368313993]

// const utils = require('./helper/index')
// const bot = require('./bot')

var Main = require('./main')
var Cristro = require('./cristro')

const bot = require('./bot')


const app = express()

app.use(bodyParser.json()) // application/json
app.use(bodyParser.urlencoded({extended: true})) // application/x-www-form-urlencoded

// bot.info.getCreatorInfo()

app.post('/message', function(req, res) {
	try{
		const incomingMessage = req.body.message
		// console.log('message ID: ', incomingMessage.message_id)
		// console.log('From: ', incomingMessage.from.id)
		// console.log('Chat ID: ', incomingMessage.chat.id)
		// console.log('Text: ', incomingMessage.text)

		console.log(incomingMessage)

		res.end()

		if(incomingMessage.chat.type == 'private'){
			var cristro = new Cristro(incomingMessage)
			cristro.start()
		}else{
			var main = new Main(incomingMessage)
			main.start()
		}

	}catch(err){
		console.log(err)
		res.end()
	}

 //    var text = null;
 //    switch(incomingMessage.text.toLowerCase()){
 //     	case 'pay': text = '7727931260'; break;
 //     	case 'whoami': text = 'Cristro Bot'; break;
 //     	case 'creator': text = 'Chetan Prakash Meena, Kotwalo Ka Bas'; break;
 //     	default: res.end(); return false;
 //    }

	// bot.message.sendMessage(res, {chat_id, text})
})

app.listen(port, () => {
	console.log(`Telegram app Active on ${port} port.`)
})
