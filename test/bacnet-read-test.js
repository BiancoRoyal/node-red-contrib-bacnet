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

var readNode = require('../src/bacnet-read.js')
var helper = require('./helper.js')

describe('Read node Testing', function () {
  before(function (done) {
    helper.startServer(done)
  })

  afterEach(function () {
    helper.unload()
  })

  describe('Node', function () {
    it('simple read node should be loaded', function (done) {
      helper.load([readNode], [
        {
          "id": "5cd7de78.886478",
          "type": "BACnet-Read",
          "z": "a7ca7277.8f86b8",
          "name": "bacnetRead",
          "objectType": "",
          "requestInstance": "",
          "propertyId": "",
          "arrayIndex": "",
          "deviceIPAddress": "",
          "server": "",
          "multipleRead": false,
          "x": 640,
          "y": 100,
          "wires": []
        }
      ], function () {
        var bacnetRead = helper.getNode('5cd7de78.886478')
        bacnetRead.should.have.property('name', 'bacnetRead')

        done()
      }, function () {
        helper.log('function callback')
      })
    })
  })

  describe('post', function () {
    it('should fail for invalid node', function (done) {
      helper.request().post('/BACnet-read/invalid').expect(404).end(done)
    })
  })
})
