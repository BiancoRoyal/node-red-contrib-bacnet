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

var commandNode = require('../src/bacnet-command.js')
var helper = require('./helper.js')

describe('Command node Testing', function () {
  before(function (done) {
    helper.startServer(done)
  })

  afterEach(function () {
    helper.unload()
  })

  describe('Node', function () {
    it('simple read node should be loaded', function (done) {
      helper.load([commandNode], [
        {
          "id": "ed7e0d79.6afce",
          "type": "BACnet-Command",
          "z": "a7ca7277.8f86b8",
          "name": "bacnetCommand",
          "commandType": "whoIs",
          "timeDuration": 0,
          "enableDisable": 0,
          "deviceState": 0,
          "isUtc": true,
          "deviceIPAddress": "",
          "server": "ed8f6d87.1bcfe",
          "x": 660,
          "y": 220,
          "wires": []
        }
      ], function () {
        var bacnetCommand = helper.getNode('ed7e0d79.6afce')
        bacnetCommand.should.have.property('name', 'bacnetCommand')

        done()
      }, function () {
        helper.log('function callback')
      })
    })
  })

  describe('post', function () {
    it('should fail for invalid node', function (done) {
      helper.request().post('/BACnet-command/invalid').expect(404).end(done)
    })
  })
})
