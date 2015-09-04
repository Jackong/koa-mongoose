var expect = require('chai').expect
var koa = require('koa')
var request = require('supertest-koa-agent');
var middleware = require('../lib/mongoose')
var mongoose = middleware.mongoose
var schema = require('./schemas/user')
const HOST = process.env.HOST

describe('middleware', () => {

    describe('with models', () => {
        var app = koa()
        var User = mongoose.model('User', schema)
        app.use(middleware({
            user: '',
            pass: '',
            host: HOST,
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
            host: HOST,
            port: 27017,
            database: 'test',
            schemas: __dirname + '/schemas',
            db: {
                native_parser: true
            },
            server: {
                poolSize: 5
            }
        }))

        app.use(function* (next) {
            var model = this.query.model
            var user = this.document(model, {
                name: 'jackong',
                age: 17
            })
            var doc1 = yield user.saveQ()

            var User = this.model(model)
            var doc2 = yield User.findOneQ({name: user.name})
            this.body = {
                doc1: doc1,
                doc2: doc2
            }
        })

        it('should be success if model exist', done => {
            request(app)
            .put('/api/users?model=user')
            .expect(200)
            .end((err, res) => {
                expect(err).to.be.not.exist
                expect(res.body.doc1).have.property('name', res.body.doc2.name)
                done()
            })
        })

        it('should be fail if model not found', done => {
            request(app)
            .put('/api/users?model=item')
            .expect(400, 'Model not found: test.item')
            .end(done)
        })

        it('should be success for sub-model', done => {
            request(app)
            .put('/api/users?model=user.pet')
            .expect(200)
            .end((err, res) => {
                expect(err).to.be.not.exist
                expect(res.body.doc1).have.property('name', res.body.doc2.name)
                done()
            })
        })
    })

    describe('with database', () => {
        var app = koa()
        app.use(middleware({
            user: '',
            pass: '',
            host: HOST,
            port: 27017,
            database: ctx => ctx.headers['x-app'],
            schemas: __dirname + '/schemas/',
            db: {
                native_parser: true
            },
            server: {
                poolSize: 5
            }
        }))

        app.use(function* (next) {
            var user = this.document(this.query.model, {
                name: 'jackong',
                age: 17
            })
            var doc = yield user.saveQ()

            this.body = {
                user: doc
            }
        })

        it('should be success if model exist', done => {
            request(app)
            .put('/api/users?model=user')
            .set('X-App', 'app')
            .expect(200)
            .end((err, res) => {
                expect(err).to.be.not.exist
                expect(res.body.user).have.property('name', 'jackong')
                done()
            })
        })

        it('should be fail if model not found', done => {
            request(app)
            .put('/api/users?model=item')
            .set('X-App', 'app')
            .expect(400, 'Model not found: app.item')
            .end(done)
        })
    })

})
