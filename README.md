# koa-mongoose
mongoose middleware for koa

## Features

* use [mongoose-q](https://github.com/iolo/mongoose-q)
* use with models
* use with schemas
* use with different database


## Examples

### With models

```js
var app = require('koa')()
var mongoose = require('koa-mongoose')
var User = require('./models/user')

app.use(mongoose({
    user: '',
    pass: '',
    host: '127.0.0.1',
    port: 27017,
    database: 'test',
    db: {
        native_parser: true
    },
    server: {
        poolSize: 5
    }
}))

app.use(function* (next) {
    var user = new User({
        account: 'test',
        password: 'test'
    })
    yield user.saveQ()
    this.body = 'OK'
})

```

### With schemas

```js
var app = require('koa')()
var mongoose = require('koa-mongoose')

app.use(mongoose({
    username: '',
    password: '',
    host: '127.0.0.1',
    port: 27017,
    database: 'test',
    schemas: './schemas'
    db: {
        native_parser: true
    },
    server: {
        poolSize: 5
    }
}))

app.use(function* (next) {
    var User = this.model('User')
    var user = new User({
        account: 'test',
        password: 'test'
    })
    //or
    var user = this.document('User', {
        account: 'test',
        password: 'test'
    })

    yield user.saveQ()
    this.body = 'OK'
})
```

### With database
```js
var app = require('koa')()
var mongoose = require('koa-mongoose')

app.use(mongoose({
    username: '',
    password: '',
    host: '127.0.0.1',
    port: 27017,
    database: ctx => {
        return ctx.headers['x-app']
    },
    schemas: './schemas'
    db: {
        native_parser: true
    },
    server: {
        poolSize: 5
    }
}))

app.use(function* (next) {
    var user = this.document('User', {
        account: 'test',
        password: 'test'
    })

    yield user.saveQ()
    this.body = 'OK'
})
```

## Tests
```shell
cd test && docker-compose up -d
npm test
```
