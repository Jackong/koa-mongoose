var mongoose = require('mongoose-q')()
module.exports = new mongoose.Schema({
    name: {type: String},
    age: {type: Number}
})
