var expect = require('chai').expect
var koa = require('koa')
var request = require('supertest-koa-agent');
var middleware = require('../lib/mongoose')
var mongoose = require('mongoose-q')()
var Schema = require('./schemas/user')

describe('models', () => {
    var app = koa()
    var User = mongoose.model('User', Schema)
    app.use(middleware({
        user: '',
        pass: '',
        host: '192.168.59.103',
        port: 27017,
        database: 'test',
        db: {
            native_parser: true
        }
    }))

    app.use(function* (next) {
        var user = new User({
            name: 'jackong',
            age: 17
        })
        var doc = yield user.saveQ()
        this.body = {
            user: doc
        }
    })

    it('should be success', done => {
        request(app)
        .put('/api/users')
        .expect(200)
        .end((err, res) => {
            expect(res.body.user).to.have.property('name', 'jackong')
            done()
        })
    })
})

describe('schemas', () => {

})

describe('database', () => {

})
