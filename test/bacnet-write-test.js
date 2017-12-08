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

var injectNode = require('node-red/nodes/core/core/20-inject.js')
var clientNode = require('../src/bacnet-client.js')
var serverNode = require('../src/bacnet-server.js')
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
      helper.load([serverNode, writeNode, injectNode, clientNode], [
        {
          "id": "1bf6dfe7.a8473",
          "type": "BACnet-Server",
          "z": "11c6703a.132f6",
          "name": "dnpServer",
          "x": 330,
          "y": 190,
          "wires": [
            []
          ]
        },
        {
          "id": "a6e51b5e.a116d8",
          "type": "BACnet-Write",
          "z": "11c6703a.132f6",
          "name": "dnpWrite",
          "server": "7576cb96.0fe7a4",
          "x": 330,
          "y": 250,
          "wires": [
            []
          ]
        },
        {
          "id": "4d910d12.b6bbf4",
          "type": "inject",
          "z": "11c6703a.132f6",
          "name": "injectTrue",
          "topic": "",
          "payload": "true",
          "payloadType": "bool",
          "repeat": "",
          "crontab": "",
          "once": false,
          "x": 180,
          "y": 250,
          "wires": [
            [
              "a6e51b5e.a116d8"
            ]
          ]
        },
        {
          "id": "7576cb96.0fe7a4",
          "type": "BACnet-Client",
          "z": "",
          "name": "dnpClient"
        }
      ], function () {
        var inject = helper.getNode('4d910d12.b6bbf4')
        inject.should.have.property('name', 'injectTrue')

        var dnpServer = helper.getNode('1bf6dfe7.a8473')
        dnpServer.should.have.property('name', 'dnpServer')

        var dnpClient = helper.getNode('7576cb96.0fe7a4')
        dnpClient.should.have.property('name', 'dnpClient')

        var dnpWrite = helper.getNode('a6e51b5e.a116d8')
        dnpWrite.should.have.property('name', 'dnpWrite')

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
