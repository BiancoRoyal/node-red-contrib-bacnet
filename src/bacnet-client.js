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
    this.adpuTimeout = config.adpuTimeout || 6000

    let node = this
    node.devices = []

    node.on('input', function (msg) {
      msg.devices = node.devices
      node.send(msg)
    })

    node.client = new BACnet({adpuTimeout: node.adpuTimeout})

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
  }

  RED.nodes.registerType('BACnet-Client', BACnetClient)
}
