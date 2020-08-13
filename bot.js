
const Payment = require('./payment')
const Message = require('./message')
const Filter = require('./filter')
const Info = require('./info')
const Table = require('./table')
const Group = require('./group')

exports.payment = new Payment()
exports.message = new Message()
exports.filter = new Filter()
exports.info = new Info()
exports.table = new Table()
exports.group = new Group()

exports.author = 'Chetan Prakash Meena'