/**
 * node-red-contrib-bacnet - The MIT License
 **/

'use strict'

var covNode = require('../src/bacnet-cov.js')
var deviceNode = require('../src/bacnet-device.js')
var clientNode = require('../src/bacnet-client.js')
var instanceNode = require('../src/bacnet-instance.js')

var helper = require('node-red-node-test-helper')
helper.init(require.resolve('node-red'))

describe('COV node Testing', function () {
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
    it('simple COV node should be loaded', function (done) {
      helper.load([deviceNode, clientNode, instanceNode, covNode], [
        {
          id: 'e2f5a3b1.c7d9e',
          type: 'BACnet-COV',
          z: 'ad26e8b.6b24498',
          name: 'bacnetCOV',
          objectType: '8',
          instance: 'cf0dca49.2a9ac',
          subscriberProcessId: 0,
          covType: 'confirmed',
          lifetime: 0,
          device: 'b289851b.dec6f8',
          server: '1528f96c.56d047',
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
        var bacnetCOV = helper.getNode('e2f5a3b1.c7d9e')
        bacnetCOV.should.have.property('name', 'bacnetCOV')

        done()
      }, function () {
        helper.log('function callback')
      })
    })
  })

  describe('post', function () {
    it('should fail for invalid node', function (done) {
      helper.request().post('/BACnet-cov/invalid').expect(404).end(done)
    })
  })
})
