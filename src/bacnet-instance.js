/*
 The MIT License

 Copyright (c) 2017 - Klaus Landsdorf (http://bianco-royal.de/)
 All rights reserved.
 node-red-contrib-bacnet
 */
'use strict'

module.exports = function (RED) {
  function BACnetInstance (config) {
    RED.nodes.createNode(this, config)
    this.name = config.name
    this.instanceAddress = parseInt(config.instanceAddress) || 0
  }

  RED.nodes.registerType('BACnet-Instance', BACnetInstance)
}
