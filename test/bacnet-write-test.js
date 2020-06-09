/**
 * Original Work Copyright 2014 IBM Corp.
 * node-red
 *
 * Copyright (c) 2017,2018,2019,2020 Klaus Landsdorf (https://osi.bianco-royal.com/)
 * All rights reserved.
 * node-red-contrib-bacnet - The MIT License
 *
 **/

'use strict'

var writeNode = require('../src/bacnet-write.js')
var deviceNode = require('../src/bacnet-device.js')
var clientNode = require('../src/bacnet-client.js')
var instanceNode = require('../src/bacnet-instance.js')

var helper = require('node-red-node-test-helper')
helper.init(require.resolve('node-red'))

describe('Write node Testing', function () {
  beforeEach(function (done) {
    helper.startServer(function () {
      done()
    })
  })

  afterEach(function (done) {
    helper.unload().then(function () {
      helper.stopServer(function () {
        done()
      })
    }).catch(function () {
      helper.stopServer(function () {
        done()
      })
    })
  })

  describe('Node', function () {
    it('simple write node should be loaded', function (done) {
      helper.load([deviceNode, clientNode, instanceNode, writeNode], [
        {
          id: 'bdc5fbd.9678608',
          type: 'BACnet-Write',
          z: 'ad26e8b.6b24498',
          name: 'bacnetWrite',
          objectType: 8,
          instance: 'cf0dca49.2a9ac',
          valueTag: 9,
          valueValue: '',
          propertyId: 8,
          priority: 14,
          device: 'b289851b.dec6f8',
          server: '1528f96c.56d047',
          multipleWrite: false,
          wires: [
            []
          ]
        },
        {
          id: 'cf0dca49.2a9ac',
          type: 'BACnet-Instance',
          z: '',
          name: 'Room Simulator YABE',
          instanceAddress: '3342490'
        },
        {
          id: 'b289851b.dec6f8',
          type: 'BACnet-Device',
          z: '',
          name: 'Windows VM',
          deviceAddress: '192.168.1.94'
        },
        {
          id: '1528f96c.56d047',
          type: 'BACnet-Client',
          z: '',
          name: '',
          adpuTimeout: '',
          port: '',
          interface: '',
          broadcastAddress: ''
        }
      ], function () {
        var bacnetWrite = helper.getNode('bdc5fbd.9678608')
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
