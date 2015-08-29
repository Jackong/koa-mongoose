var mongoose = require('mongoose')
var glob = require("glob")

var open = (db, options) => {
    if (!options || !options.host || !options.port) {
        throw new Error('options not found')
    }

    var database = typeof options.database === 'function' ? undefined : options.database

    db.on('error', err => {
        db.close();
    });

    db.open(options.host, database, options.port, options)

    return db
}

module.exports = options => {
    var db = mongoose.connection
    var schemaMap = {}

    if (options.schemas) {
        db = mongoose.createConnection()
        var files = glob.sync(options.schemas + '/**/*.js')
        files.map(file => {
            var model = file
            .replace(options.schemas, '')
            .replace(/\.js$/g, '')
            .replace(/\//g, '.')
            .toLowerCase()
            var Schema = require(file)
            schemaMap[model] = Schema
        })
    }
    open(db, options)
    return function* (next) {
        this.model = model => db.model(model, schemaMap[model.toLowerCase()])
        this.document = (model, document) => new (this.model(model))(document)
        
        yield next
    }
}
