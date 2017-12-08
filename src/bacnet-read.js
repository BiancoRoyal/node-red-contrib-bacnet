/*
 The MIT License

 Copyright (c) 2017 - Klaus Landsdorf (http://bianco-royal.de/)
 All rights reserved.
 node-red-contrib-bacnet
 */
'use strict'

module.exports = function (RED) {
  function BACnetRead (config) {
    RED.nodes.createNode(this, config)
    this.name = config.name

    let node = this

    node.status({fill: 'blue', shape: 'ring', text: 'not ready to use'})

    node.on('input', function (msg) {
      node.send(msg)
    })
  }

  RED.nodes.registerType('BACnet-Read', BACnetRead)
}
