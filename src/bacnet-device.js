/*
 The MIT License

 Copyright (c) 2017 - Klaus Landsdorf (http://bianco-royal.de/)
 All rights reserved.
 node-red-contrib-bacnet
 */
'use strict'

module.exports = function (RED) {
  function BACnetDevice (config) {
    RED.nodes.createNode(this, config)
    this.name = config.name
    this.deviceAddress = config.deviceAddress || '127.0.0.1'
  }

  RED.nodes.registerType('BACnet-Device', BACnetDevice)
}
