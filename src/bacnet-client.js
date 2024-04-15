/*
 The MIT License

 Copyright (c) 2017,2018,2019,2020,2021,2022,2023,2024 Klaus Landsdorf (http://plus4nodered.com/)
 All rights reserved.
 node-red-contrib-bacnet
 */
'use strict'

module.exports = function (RED) {
  const bacnetCore = require('./core/bacnet-core')
  const BACnet = require('node-bacnet')

  function BACnetClient (config) {
    RED.nodes.createNode(this, config)
    this.name = config.name
    this.adpuTimeout = parseInt(config.adpuTimeout) || 6000
    this.port = parseInt(config.port) || 47808
    this.IPAddress = config.IPAddress || '0.0.0.0'
    this.broadcastAddress = config.broadcastAddress || '0.0.0.255'

    const node = this
    node.devices = []

    if (node.IPAddress) {
      bacnetCore.internalDebugLog('client with IP settings')
      node.client = new BACnet({ adpuTimeout: node.adpuTimeout, port: node.port, interface: node.IPAddress, broadcastAddress: node.broadcastAddress })
    } else {
      bacnetCore.internalDebugLog('client without IP settings')
      node.client = new BACnet({ adpuTimeout: node.adpuTimeout, port: node.port })
    }

    if (node.client) {
      node.client.on('iAm', (device) => {
        node.devices.push(device)
        bacnetCore.internalDebugLog('iAm Event')
        bacnetCore.internalDebugLog('address: ', device.address)
        bacnetCore.internalDebugLog('deviceId: ', device.deviceId)
        bacnetCore.internalDebugLog('maxAdpu: ', device.maxAdpu)
        bacnetCore.internalDebugLog('segmentation: ', device.segmentation)
        bacnetCore.internalDebugLog('vendorId: ', device.vendorId)
      })

      node.client.on('timeout', function () {
        bacnetCore.internalDebugLog('timeout')
      })

      node.client.whoIs()

      node.client.on('error', function (err) {
        node.error(err, { payload: 'BACnet Client Error' })
        node.client.close()
        node.client = null
        node.devices = []
        node.client = new BACnet({ adpuTimeout: node.adpuTimeout, port: node.port, interface: node.IPAddress, broadcastAddress: node.broadcastAddress })
      })
    }

    node.on('input', function (msg) {
      msg.devices = node.devices
      node.send(msg)
    })

    node.on('close', function (done) {
      if (node.client) {
        node.client.close()
        node.client = null
      }
      done()
    })

    node.whoIsExplicit = function (lowLimit, highLimit, deviceIPAddress, cb) {
      node.devices = []
      const options = {
        lowLimit,
        highLimit,
        deviceIPAddress
      }
      node.client.whoIs(options)
      setTimeout(cb, 3000)
    }

    node.whoIs = function (cb) {
      node.devices = []
      node.client.whoIs()
      setTimeout(cb, 3000)
    }
  }

  RED.nodes.registerType('BACnet-Client', BACnetClient)
}
