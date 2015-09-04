var glob = require("glob")
var util = require('util')
var mongoose = require('mongoose-q')()

var middleware = module.exports = options => {
    mongoose = options.mongoose ? options.mongoose : mongoose
    //mode: model
    var db = mongoose.connection
    var models = {}
    var dbs = {}
    if (options.schemas) {
        //mode: schema
        db = mongoose.createConnection()
        var schemas = options.schemas + (options.schemas.lastIndexOf('/') === (options.schemas.length - 1) ? '' : '/')
        var files = glob.sync(schemas + '/**/*.js')
        files.map(file => {
            var model = file
            .replace(schemas, '')
            .replace(/\.js$/g, '')
            .replace(/\//g, '.')
            .toLowerCase()
            var schema = require(file)
            models[model] = db.model(model, schema)
        })
    }
    middleware.open(db, options)
    return function* (next) {
        if (typeof options.database === 'function') {
            //mode: database
            var database = options.database(this)
            if (!dbs.hasOwnProperty(database)) {
                dbs[database] = db.useDb(database)
            }
            this.model = model => {
                var name = model.toLowerCase()
                if (!models.hasOwnProperty(name)) {
                    this.throw(400, util.format('Model not found: %s.%s', database, model))
                }
                return dbs[database].model(model, models[name].schema)
            }
        } else {
            this.model = model => {
                var name = model.toLowerCase()
                if (!models.hasOwnProperty(name)) {
                    this.throw(400, util.format('Model not found: %s.%s', options.database, model))
                }
                return models[name]
            }
        }
        this.document = (model, document) => new (this.model(model))(document)
        yield next
    }
}

middleware.mongoose = mongoose

middleware.open = (db, options) => {
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
