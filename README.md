# koa-mongoose

[![NPM version][npm-image]][npm-url]
[![build status][travis-image]][travis-url]
[![David deps][david-image]][david-url]
[![node version][node-image]][node-url]
[![Gittip][gittip-image]][gittip-url]

[npm-image]: https://img.shields.io/npm/v/koa-mongoose.svg?style=flat-square
[npm-url]: https://npmjs.org/package/koa-mongoose
[travis-image]: https://travis-ci.org/Jackong/koa-mongoose.svg?branch=master
[travis-url]: https://travis-ci.org/Jackong/koa-mongoose
[david-image]: https://img.shields.io/david/Jackong/koa-mongoose.svg?style=flat-square
[david-url]: https://david-dm.org/Jackong/koa-mongoose
[node-image]: https://img.shields.io/badge/node.js-%3E=_0.11-green.svg?style=flat-square
[node-url]: http://nodejs.org/download/
[gittip-image]: https://img.shields.io/gratipay/Jackong.svg
[gittip-url]: https://gratipay.com/~Jackong

> mongoose middleware for koa

## Install

[![NPM](https://nodei.co/npm/koa-mongoose.png?downloads=true)](https://nodei.co/npm/koa-mongoose/)

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
    mongoose: require('mongoose-q')(),//custom mongoose
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
HOST=YOUR-DOCKER-HOST npm test
```

## Licences

[MIT](LICENSE)
