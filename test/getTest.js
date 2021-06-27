require("../app.js");
var supertest = require('supertest');
var express = require('express');
var assert = require('assert');
var should = require('should');

describe.skip('Baseline tests', function () {
    describe('indexOf()', function () {
        it('should return -1 when the value is not present'), function () {
            assert.equal(-1, [1, 2, 3].indexOf(5));
            assert.equal(-1, [1, 2, 3].indexOf(0));
            [1, 2, 3].indexOf(5).should.equal(-1);
            [1, 2, 3].indexOf(0).should.equal(-1);
        }
    });
});

var request = supertest("http://localhost:3000");
describe('/person tests', function () {
    it('should return Ted for id 1', function (done) {
        request.get('/persons/1')
            .expect(200)
            .expect('Content-Type', /json/)
            .expect(function (res) {
                res.body.id.should.equal(1);
                res.body.firstName.should.equal("Ted");
                res.body.lastName.should.equal("Neward");
                res.body.status.should.equal("MEANing");
            }).end(done);
    });

    it('should allow me to add a person', function (done) {
        request
            .post('/persons')
            .send({ 'firstName': 'Ted', 'lastName': 'Pattinson', 'status': 'SharePointing' })
            .expect(200)
            .expect(function (res) {
                should.exist(res.body.id);
                res.body.firstName.should.equal("Ted");
                res.body.lastName.should.equal("Pattinson");
            })
            .end(done);
    });

    it('should allow me to update a person', function (done) {
        request
            .put('/persons/1')
            .send({ 'firstName': 'Johnny', 'lastName': 'Walker', 'status': 'Wandering' })
            .expect(200)
            .expect(function (res) {
                res.body.id.should.equal(1);
                res.body.firstName.should.equal("Johnny");
                res.body.lastName.should.equal("Walker");
                res.body.status.should.equal("Wandering");
            })
            .end(done);
    });

    it('should allow me to delete a person', function (done) {
        request
            .delete('/persons/1')
            .end(done);
    });
});