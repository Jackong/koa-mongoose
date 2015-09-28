var glob = require("glob")
var util = require('util')
var mongoose = require('mongoose-q')()

var middleware = module.exports = options => {
    mongoose = options.mongoose ? options.mongoose : mongoose
    //mode: model
    var db = mongoose.connection
    middleware.models = {}
    middleware.dbs = {}
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
            middleware.models[model] = db.model(model, schema)
        })
    }
    middleware.open(db, options)
    return function* (next) {
        var database = typeof options.database === 'function' ? options.database(this) : options.database

        if (!middleware.dbs.hasOwnProperty(database)) {
            middleware.dbs[database] = db.useDb(database)
        }
        this.model = model => {
            try {
                return middleware.model(database, model)
            } catch(err) {
                this.throw(400, err.message)
            }
        }
        this.document = (model, document) => new (this.model(model))(document)
        yield next
    }
}

middleware.model = (database, model) => {
    var name = model.toLowerCase()
    if (!middleware.models.hasOwnProperty(name)) {
        throw new Error(util.format('Model not found: %s.%s', database, model))
    }
    return middleware.dbs[database].model(model, middleware.models[name].schema)
}

middleware.document = (database, model, document) => new (middleware.model(database, model))(document)

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
