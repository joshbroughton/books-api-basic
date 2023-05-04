require('dotenv').config()
const app = require('../server.js')
const mongoose = require('mongoose')
const chai = require('chai')
const chaiHttp = require('chai-http')
const assert = chai.assert
const jwt = require('jsonwebtoken');
const chaiJWT = require('chai-jwt');

const User = require('../models/user.js')

chai.config.includeStack = true

const expect = chai.expect
const should = chai.should()
chai.use(chaiHttp)

/**
 * root level hooks
 */
after((done) => {
  // required because https://github.com/Automattic/mongoose/issues/1251#issuecomment-65793092
  mongoose.models = {}
  mongoose.modelSchemas = {}
  mongoose.connection.close()
  done()
})

const SAMPLE_OBJECT_ID = 'aaaaaaaaaaaa' // 12 byte string
let token;

describe('User API endpoints', () => {
    // Create a sample user for use in tests.
    beforeEach( async () => {
        const sampleUser = new User({
            username: 'myuser',
            password: 'mypassword',
            _id: SAMPLE_OBJECT_ID
        })
        await sampleUser.save();
        token = jwt.sign({ userId: sampleUser._id }, process.env.SECRET_KEY, { expiresIn: '1m' });
    })

    // Delete sample user.
    afterEach((done) => {
        User.deleteMany({ username: ['myuser', 'anotheruser'] })
        .then(() => {
            done()
        })
    })

    it('should allow a new user to sign up', async () => {
        chai.request(app)
            .post('/users/sign-up')
            .send({username: 'anotheruser', password: 'mypassword'})
            .end(async (err, res) => {
                if (err) { done(err) }
                expect(res.body.user).to.be.an('object')
                expect(res.body.user).to.have.property('username', 'anotheruser')

                // check that user is actually inserted into database
                const user = await User.findOne({username: 'anotheruser'})
                expect(user).to.be.an('object');
            })
    });

    it('should return a valid JWT when valid login credentials are provided', async () => {
        chai.request(app)
            .post('users/login')
            .send({ username: 'myuser', password: 'mypassword' })
            .end(async (err, res) => {
                if (err) { done(err) }
                expect(res.body.token).to.be.a.jwt;
            });
    });

    it('should return a an invalid credential message when wrong password provided', async () => {
        chai.request(app)
            .post('users/login')
            .send({ username: 'myuser', password: 'password' })
            .end(async (err, res) => {
                if (err) { done(err) }
                expect(res.body.message).to.be.a('string');
                expect(res.body.message).to.equal('Wrong Username or password');
            });
    });

    it('should get profile info for the current user', (done) => {
        chai.request(app)
            .get(`/users/show`)
            .set('Authorization', `Bearer ${token}`)
            .end((err, res) => {
                if (err) { done(err) }
                expect(res).to.have.status(200)
                expect(res.body.user).to.be.an('object')
                expect(res.body.user.username).to.equal('myuser')
                expect(res.body.user.password).to.equal(undefined)
                done()
            })
    })

    it('should update a user', async () => {
        chai.request(app)
            .put(`/users/update`)
            .set('Authorization', `Bearer ${token}`)
            .send({username: 'anotheruser'})
            .end( async (err, res) => {
                if (err) { done(err) }
                expect(res.body.user).to.be.an('object');
                expect(res.body.user).to.have.property('username', 'anotheruser');

                // check that user is actually inserted into database
                const user = await User.findOne({username: 'anotheruser'});
                expect(user).to.be.an('object');
            })
    })

    it('should delete a user', async () => {
        chai.request(app)
            .delete(`/users/delete`)
            .set('Authorization', `Bearer ${token}`)
            .end(async (err, res) => {
                if (err) { done(err) }
                expect(res.body.message).to.equal('Successfully deleted.')
                expect(res.body._id).to.equal(SAMPLE_OBJECT_ID)

                // check that user is actually deleted from database
                const user = await User.findOne({username: 'myuser'})
                expect(user).to.equal(null)
            })
    })
})
