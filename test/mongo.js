var chai = require('chai')
var spies = require('chai-spies')
var koa = require('koa')
var request = require('supertest-koa-agent')
var middleware = require('../lib/mongoose')
var mongoose = middleware.mongoose
var schema = require('./schemas/user')
const HOST = process.env.HOST

chai.use(spies)

var expect = chai.expect

describe('middleware', () => {

    describe('with models', () => {
        var app = new koa()
        var User = mongoose.model('User', schema)
        app.use(middleware({
            user: '',
            pass: '',
            host: HOST,
            port: 27017,
            database: 'test',
            mongodbOptions:{
                poolSize: 5,
                native_parser: true
            }
        }))

        app.use(async (ctx, next) => {
            var user = new User({
                name: 'jackong',
                age: 17
            })
            var doc = await user.save()
            ctx.body = {
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

    describe('with uri', () => {
        var app = new koa()
        var User = mongoose.model('User', schema)
        app.use(middleware({
            uri:`mongodb://${HOST}:27017/test`,
            mongodbOptions:{
                poolSize: 5,
                native_parser: true
            }
        }))

        app.use(async (ctx, next) => {
            var user = new User({
                name: 'jackong',
                age: 17
            })
            var doc = await user.save()
            ctx.body = {
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

    describe('with events', () => {
        var app = new koa()
        var User = mongoose.model('User', schema)

        function spyOnMe() {
            console.log('hello there');
        }

        var spy = chai.spy(spyOnMe);

        app.use(middleware({
            uri:`mongodb://${HOST}:27017/test`,
            mongodbOptions:{
                poolSize: 5,
                native_parser: true
            },
            events: {
                connected: spy
            }
        }))

        it('should fire cb on connected', done => {
            expect(spy).to.have.been.called();
            done()
        })
    })

    describe('with schemas', () => {
        var app = new koa()
        app.use(middleware({
            user: '',
            pass: '',
            host: HOST,
            port: 27017,
            database: 'test',
            mongodbOptions:{
                poolSize: 5,
                native_parser: true
            }
        }))

        app.use(async (ctx, next) => {
            var model = ctx.query.model
            var user = ctx.document(model, {
                name: 'jackong',
                age: 17
            })
            var doc1 = await user.save()

            var User = ctx.model(model)
            var doc2 = await User.findOne({name: user.name})
            ctx.body = {
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
        var app = new koa()
        app.use(middleware({
            user: '',
            pass: '',
            host: HOST,
            port: 27017,
            database: ctx => ctx.headers['x-app'],
            schemas: __dirname + '/schemas/',
            mongodbOptions:{
                poolSize: 5,
                native_parser: true
            }
        }))

        app.use(async ctx => {
            var user = ctx.document(ctx.query.model, {
                name: 'jackong',
                age: 17
            })
            var doc = await user.save()

            ctx.body = {
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
