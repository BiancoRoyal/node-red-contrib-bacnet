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
    this.objectType = config.objectType || 8
    this.objectInstance = config.objectInstance || 4194303
    this.propertyId = config.propertyId || 8
    this.arrayIndex = config.arrayIndex || null
    this.deviceIPAddress = config.deviceIPAddress || '127.0.0.1'
    this.multipleRead = config.multipleRead

    this.connector = RED.nodes.getNode(config.server)

    let node = this

    node.status({fill: 'green', shape: 'dot', text: 'active'})

    node.on('input', function (msg) {
      if (!node.connector) {
        node.error(new Error('Client Not Ready To Read'), msg)
        return
      }

      if (node.multipleRead) {
        let requestArray = [{
          objectIdentifier: {
            type: msg.payload.objectType || node.objectType,
            instance: msg.payload.objectInstance || node.objectInstance
          },
          propertyReferences: [{
            propertyIdentifier: msg.payload.propertyId || node.propertyId
          }]
        }]

        node.connector.client.readPropertyMultiple(
          msg.payload.deviceIPAddress || node.deviceIPAddress,
          msg.payload.requestArray || requestArray,
          function (err, value) {
            if (err) {
              node.error(err, msg)
            } else {
              msg.payload.bacnetValue = value
              node.send(msg)
            }
          })
      } else {
        node.connector.client.readProperty(
          msg.payload.deviceIPAddress || node.deviceIPAddress,
          msg.payload.objectType || node.objectType,
          msg.payload.objectInstance || node.objectInstance,
          msg.payload.propertyId || node.propertyId,
          null,
          function (err, value) {
            if (err) {
              node.error(err, msg)
            } else {
              msg.payload.bacnetValue = value
              node.send(msg)
            }
          })
      }
    })
  }

  RED.nodes.registerType('BACnet-Read', BACnetRead)
}
