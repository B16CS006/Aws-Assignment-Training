
var admin = require("firebase-admin");
var serviceAccount = require("./cristrobot.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://cristrobot.firebaseio.com"
});

firestore = admin.firestore();

class Database {
	constructor(){ 
	}


	appInfo = () => {
		console.log('App name: ', firebase.app().name);
	}

	getDatabase = () => {
		return firestore;
	}

	increment = (path, field, value, initValue=0) => {
		return new Promise(function(resolve, reject){
			firestore.runTransaction(t => {
				return t.get(firestore.doc(path))
					.then(doc => {
						if(!doc.exists || !(field in doc.data())){
							t.update(firestore.doc(path), {[field]: initValue}, {merge: true});
						}
						t.update(firestore.doc(path), {[field]: admin.firestore.FieldValue.increment(value)});
					})
			}).then(result => {
				resolve(result)
			}).catch(err => {
				reject(err)
			})
		});
	}

	getIncrement = (value) => {
		return admin.firestore.FieldValue.increment(value);
	}

	execute = (ref, data, action='set') =>{
		return new Promise(function(resolve, reject){
			var func = new Function('ref.' + action);
			func(data).then(() => { resolve() }).catch((err) => { reject(err) })
		});
	}

	executeBatch = (items) => {
		return new Promise(function(resolve, reject){
			var batch = firestore.batch()
			for (var item of items){
				// console.log(item)
				if(item.data === undefined)
					batch[item.action](item.ref);
				else if(item.action === 'update')
					batch.update(item.ref, item.data, {merge: true});
				else
					batch[item.action](item.ref, item.data);
			}
			batch.commit().then(() => resolve()).catch((err) => reject(err));
		})
	}

	getReference = (path, doc=true) => {
		if (doc){
			return firestore.doc(path)
		}else{
			return firestore.collection(path)
		}
	}

	getCollection = (path) => {
		return new Promise(function(resolve, reject){
			firestore.collection(path).get()
				.then((snapshot) => {
					if(snapshot.empty){
						resolve([])
					}else{
						resolve(snapshot)
					}
				}).catch((err) => {
					reject(err);
				});
		});
	}
	
	getDocument = (path) => {
		return new Promise(function(resolve, reject){
			firestore.doc(path).get()
				.then((doc) => {
					if(!doc.exists){
						reject(new Error('No such document exists'))
					}else{
						resolve(doc.data())
					}
				}).catch((err) => {
					reject(err)
				});
		});
	}

	setDocument = (path, data, merge=true) => {
		return new Promise(function(resolve, reject){
			firestore.doc(path).set(data, {merge: merge})
				.then(() => {
					resolve()
				}).catch((err) => {
					reject(err)
				})
		});
	}

	getFieldValue = (path, field) => {
		const that = this
		return new Promise(function(resolve, reject){
			that.getDocument(path).then(data => {
				if(field in data){
					resolve(data[field])
				}else{
					reject(new Error('No such field exists'))
				}
			}).catch(err => reject(err))
		})
	}

	deleteField = (path, field) => {
		return new Promise(function(resolve, reject){
			firestore.doc(path).update({[field]: admin.firestore.FieldValue.delete()})
				.then(() => resolve())
				.catch(err => reject(err))
		})
	}

	deleteDocument = (path) => {
		return new Promise(function(resolve, reject){
			firestore.doc(path).delete()
				.then(() => {
					resolve()
				}).catch(err => {
					reject(err)
				})
		})
	}

	deleteCollection = (path) => {
		return new Promise(function(resolve, reject){
			firestore.collection(path).delete()
				.then(() => {
					resolve()
				}).catch(err => {
					reject(err)
				})
		})
	}

	addDocument = (path, data, callback=null) => {
		return new Promise(function(resolve, reject){
			firestore.collection(path).add(data).then(ref => {
				resolve(ref.id)
			}).catch((err) =>{
				reject(err)
			});
		});
	}

}

module.exports = Database