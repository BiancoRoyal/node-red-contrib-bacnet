/*
 The MIT License

 Copyright (c) 2017 - Klaus Landsdorf (http://bianco-royal.de/)
 All rights reserved.
 node-red-contrib-bacnet
 */
'use strict'

module.exports = function (RED) {
  let bacnetCore = require('./core/bacnet-core')
  // let BACnet = require('bacstack')

  function BACnetRead (config) {
    RED.nodes.createNode(this, config)

    this.name = config.name
    this.requestType = config.requestType || 8
    this.requestInstance = config.requestInstance || 4194303
    this.requestPropertyIdentifier = config.requestPropertyIdentifier || 8
    this.deviceIPAddress = config.deviceIPAddress || '127.0.0.1'

    this.connector = RED.nodes.getNode(config.server)

    let node = this

    node.status({fill: 'green', shape: 'dot', text: 'active'})

    node.on('input', function (msg) {
      if (!node.connector) {
        node.error(new Error('Client Not Ready To Read'), msg)
        return
      }

      let requestArray = [{
        objectIdentifier: {type: msg.payload.requestType || node.requestType, instance: msg.payload.requestInstance || node.requestInstance},
        propertyReferences: [{propertyIdentifier: msg.payload.requestPropertyIdentifier || node.requestPropertyIdentifier}]
      }]

      bacnetCore.internalDebugLog(requestArray)

      node.connector.client.readPropertyMultiple(msg.payload.deviceIPAddress || node.deviceIPAddress, requestArray, function (err, value) {
        if (err) {
          node.error(err, msg)
        } else {
          msg.payload = value
          node.send(msg)
        }
      })
    })
  }

  RED.nodes.registerType('BACnet-Read', BACnetRead)
}
