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
var deviceNode = require('../src/bacnet-device.js')
var clientNode = require('../src/bacnet-client.js')
var instanceNode = require('../src/bacnet-instance.js')
var helper = require('node-red-contrib-test-helper')

describe('Read node Testing', function () {
  before(function (done) {
    helper.startServer(done)
  })

  afterEach(function () {
    helper.unload()
  })

  describe('Node', function () {
    it('simple read node should be loaded', function (done) {
      helper.load([deviceNode, clientNode, instanceNode, readNode], [
        {
          "id": "fa0424dc.f9bd",
          "type": "BACnet-Read",
          "z": "ad26e8b.6b24498",
          "name": "bacnetRead",
          "objectType": "8",
          "instance": "cf0dca49.2a9ac",
          "propertyId": "28",
          "device": "b289851b.dec6f8",
          "server": "1528f96c.56d047",
          "multipleRead": false,
          "wires": [
            []
          ]
        },
        {
          "id": "cf0dca49.2a9ac",
          "type": "BACnet-Instance",
          "z": "",
          "name": "Room Simulator YABE",
          "instanceAddress": "3342490"
        },
        {
          "id": "b289851b.dec6f8",
          "type": "BACnet-Device",
          "z": "",
          "name": "Windows VM",
          "deviceAddress": "192.168.1.94"
        },
        {
          "id": "1528f96c.56d047",
          "type": "BACnet-Client",
          "z": "",
          "name": "",
          "adpuTimeout": "",
          "port": "",
          "interface": "",
          "broadcastAddress": ""
        }
      ], function () {
        var bacnetRead = helper.getNode('fa0424dc.f9bd')
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
