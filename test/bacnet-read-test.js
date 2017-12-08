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

var clientNode = require('../src/bacnet-client.js')
var serverNode = require('../src/bacnet-server.js')
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
      helper.load([readNode, serverNode, clientNode], [
        {
          "id": "8482fcf8.62d6c",
          "type": "BACnet-Read",
          "z": "11c6703a.132f6",
          "name": "dnpRead",
          "server": "7576cb96.0fe7a4",
          "x": 220,
          "y": 130,
          "wires": [
            []
          ]
        },
        {
          "id": "1bf6dfe7.a8473",
          "type": "BACnet-Server",
          "z": "11c6703a.132f6",
          "name": "dnpServer",
          "x": 230,
          "y": 190,
          "wires": [
            []
          ]
        },
        {
          "id": "7576cb96.0fe7a4",
          "type": "BACnet-Client",
          "z": "",
          "name": "dnpClient"
        }
      ], function () {
        var dnpServer = helper.getNode('1bf6dfe7.a8473')
        dnpServer.should.have.property('name', 'dnpServer')

        var dnpClient = helper.getNode('7576cb96.0fe7a4')
        dnpClient.should.have.property('name', 'dnpClient')

        var dnpRead = helper.getNode('8482fcf8.62d6c')
        dnpRead.should.have.property('name', 'dnpRead')

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
