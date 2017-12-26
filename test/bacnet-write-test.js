/**
 * Original Work Copyright 2014 IBM Corp.
 * node-red
 *
 * Copyright (c) 2017, Klaus Landsdorf (http://bianco-royal.de/)
 * All rights reserved.
 * node-red-contrib-bacnet - The MIT License
 *
 **/

'use strict'

var writeNode = require('../src/bacnet-write.js')
var helper = require('./helper.js')

describe('Write node Testing', function () {
  before(function (done) {
    helper.startServer(done)
  })

  afterEach(function () {
    helper.unload()
  })

  describe('Node', function () {
    it('simple write node should be loaded', function (done) {
      helper.load([writeNode], [
        {
          "id": "5d5d0218.622fec",
          "type": "BACnet-Write",
          "z": "a7ca7277.8f86b8",
          "name": "bacnetWrite",
          "deviceIPAddress": "",
          "server": "ed8f6d87.1bcfe",
          "multipleWrite": false,
          "x": 640,
          "y": 160,
          "wires": []
        }
      ], function () {
        var bacnetWrite = helper.getNode('5d5d0218.622fec')
        bacnetWrite.should.have.property('name', 'bacnetWrite')

        done()
      }, function () {
        helper.log('function callback')
      })
    })
  })

  describe('post', function () {
    it('should fail for invalid node', function (done) {
      helper.request().post('/BACnet-write/invalid').expect(404).end(done)
    })
  })
})
