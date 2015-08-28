var mongoose = require('mongoose-q')()

var open = options => {
    if (!options || !options.host || !options.port) {
        throw new Error('options not found')
    }
    var db = mongoose.connection;

    db.on('error', err => {
        db.close();
    });

    var database = typeof options.database === 'function' ? undefined : options.database

    db.open(options.host, database, options.port, options);
}

module.exports = options => {
    open(options)
    return function* (next) {
        yield next
    }
}
