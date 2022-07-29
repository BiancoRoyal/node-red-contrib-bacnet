/*
 The MIT License

 Copyright (c) 2017,2018,2019,2020,2021,2022 Klaus Landsdorf (http://node-red.plus/)
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
