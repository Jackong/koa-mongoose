var expect = require('chai').expect
var koa = require('koa')
var request = require('supertest-koa-agent');
var middleware = require('../lib/mongoose')
var mongoose = require('mongoose-q')(require('mongoose'))
var Schema = require('./schemas/user')

describe('middleware', () => {

    describe('with models', () => {
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
            },
            server: { poolSize: 5 }
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
                expect(err).to.be.not.exist
                expect(res.body.user).to.have.property('name', 'jackong')
                done()
            })
        })
    })

    describe('with schemas', () => {
        var app = koa()
        app.use(middleware({
            user: '',
            pass: '',
            host: '192.168.59.103',
            port: 27017,
            database: 'test',
            schemas: __dirname + '/schemas/',
            db: {
                native_parser: true
            },
            server: { poolSize: 5 }
        }))

        app.use(function* (next) {
            var user = this.document('User', {
                name: 'jackong',
                age: 17
            })
            var doc1 = yield user.saveQ()

            var User = this.model('User')
            var doc2 = yield User.findOneQ({name: user.name})
            this.body = {
                doc1: doc1,
                doc2: doc2
            }
        })

        it('should be success', done => {
            request(app)
            .put('/api/users')
            .expect(200)
            .end((err, res) => {
                expect(err).to.be.not.exist
                expect(res.body.doc1).have.property('name', res.body.doc2.name)
                done()
            })
        })
    })

    describe('with database', () => {

    })

})
