const Database = require('./database')
const database = new Database()

class Info {
	constructor(){ 	}

	getCreatorInfo = () => {
		database.getDocument('about/creator').then((data) => {
			for (const element in data){
				console.log(element, '=>', data[element])
			}
		}).catch((err) => {
			console.log(err)
		})
	}

	getProfit = (gruouID) => {
		return new Promise(function(resolve, reject){
			database.getDocument(`groups/${gruouID}/info/profit`).then((data) => {
				if(data['total']){
					resolve(data['total'])
				}else{
					resolve(0)
				}
			}).catch(err => {
				reject(err)
			})
		})
	}

	resetProfit = (gruouID, value=0) => {
		return new Promise(function(resolve, reject){
			database.setDocument(`groups/${gruouID}/info/profit`, {total: value}).then(() => {
				resolve()
			}).catch(err => {
				reject(err)
			})
		})
	}
}

module.exports = Info