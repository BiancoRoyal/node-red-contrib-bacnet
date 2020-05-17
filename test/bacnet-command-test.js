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

var commandNode = require('../src/bacnet-command.js')
var deviceNode = require('../src/bacnet-device.js')
var clientNode = require('../src/bacnet-client.js')

var helper = require('node-red-node-test-helper')
helper.init(require.resolve('node-red'))

// https://www.dailycred.com/article/bcrypt-calculator
var testCredentials = {
  user: 'peter',
  password: '$2a$04$Dj8UfDYcMLjttad0Qi67DeKtqJM6SZ8XR.Oy70.GUvle4MlrVWaYC'
}

describe('Command node Testing', function () {
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
    it('simple read node should be loaded', function (done) {
      helper.load([deviceNode, clientNode, commandNode], [
        {
          id: '8f8d8daf.248e',
          type: 'BACnet-Command',
          z: 'ad26e8b.6b24498',
          name: 'bacnetCommand',
          commandType: 'deviceCommunicationControl',
          timeDuration: 0,
          enableDisable: 0,
          deviceState: 0,
          isUtc: true,
          lowLimit: 0,
          highLimit: 0,
          device: 'b289851b.dec6f8',
          server: '1528f96c.56d047',
          x: 300,
          y: 320,
          wires: [
            []
          ]
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
      ], testCredentials, function () {
        var bacnetCommand = helper.getNode('8f8d8daf.248e')
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
