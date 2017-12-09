/*
 The MIT License

 Copyright (c) 2017 - Klaus Landsdorf (http://bianco-royal.de/)
 All rights reserved.
 node-red-contrib-bacnet
 */
'use strict'

module.exports = function (RED) {
  let bacnetCore = require('./core/bacnet-core')
  let BACnet = require('bacstack')

  function BACnetClient (config) {
    RED.nodes.createNode(this, config)
    this.name = config.name
    this.port = config.port || 47808
    /*
    interface
    transport
    broadcastAddress
    */
    this.adpuTimeout = config.adpuTimeout || 6000

    let node = this
    node.devices = []

    node.client = new BACnet({adpuTimeout: node.adpuTimeout, port: node.port})

    if (node.client) {
      node.client.on('iAm', function (device) {
        node.devices.add(device)
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
        node.error(err, {payload: 'BACnet Client Error'})
        node.client.close()
        node.client = null
        node.devices = []
        node.client = new BACnet({adpuTimeout: node.adpuTimeout, port: node.port})
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
    })

    node.whoIsExplicit = function (lowLimit, highLimit, deviceIPAddress, cb) {
      node.devices = []
      node.client.whoIs(lowLimit, highLimit, deviceIPAddress)
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
