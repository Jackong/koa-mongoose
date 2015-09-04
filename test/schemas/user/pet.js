var mongoose = require('../../../lib/mongoose').mongoose
module.exports = new mongoose.Schema({
    name: {type: String},
    age: {type: Number}
})
