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

> mongoose middleware for koa 2

## Install

[![NPM](https://nodei.co/npm/koa-mongoose.png?downloads=true)](https://nodei.co/npm/koa-mongoose/)

## Features
* upgraded for Koa 2
* uses upgraded mongoose configured to use native `Promise`
* use with models
* use with schemas
* use with different database


## Examples

### With models

```js
const Koa = require('koa')
const mongoose = require('koa-mongoose')
const User = require('./models/user')
const app = new Koa()

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

app.use(async (ctx, next) => {
    let user = new User({
        account: 'test',
        password: 'test'
    })
    await user.save()
    ctx.body = 'OK'
})

```

### With schemas

```js
const Koa = require('koa')
const mongoose = require('koa-mongoose')
const app = new Koa()

app.use(mongoose({
    username: '',
    password: '',
    host: '127.0.0.1',
    port: 27017,
    database: 'test',
    schemas: './schemas',
    db: {
        native_parser: true
    },
    server: {
        poolSize: 5
    }
}))

app.use(async (ctx, next) => {
    let User = ctx.model('User')
    let user = new User({
        account: 'test',
        password: 'test'
    })
    //or
    let user = ctx.document('User', {
        account: 'test',
        password: 'test'
    })

    await user.save()
    ctx.body = 'OK'
})
```

### With database
```js
const Koa = require('koa')
const mongoose = require('koa-mongoose')

const app = new Koa()

app.use(mongoose({
    username: '',
    password: '',
    host: '127.0.0.1',
    port: 27017,
    database: ctx => {
        return ctx.headers['x-app']
    },
    schemas: './schemas',
    db: {
        native_parser: true
    },
    server: {
        poolSize: 5
    }
}))

app.use(async ctx => {
    let user = ctx.document('User', {
        account: 'test',
        password: 'test'
    })

    await user.save()
    ctx.body = 'OK'
})
```

## Tests
```shell
cd test && docker-compose up -d
HOST=YOUR-DOCKER-HOST npm test
```

## Licences

[MIT](LICENSE)
