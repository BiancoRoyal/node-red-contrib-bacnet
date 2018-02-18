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

  // let BACnet = require('bacstack')

  function BACnetRead (config) {
    RED.nodes.createNode(this, config)

    this.name = config.name
    this.objectType = config.objectType || 0
    this.objectInstance = config.objectInstance || 0
    this.propertyId = config.propertyId || 0
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

      let options = msg.payload.options || {}

      if (node.multipleRead) {
        bacnetCore.internalDebugLog('Multiple Read')

        let defaultRequestArray = [{
          objectId: {
            type: node.objectType,
            instance: node.objectInstance
          },
          properties: [{id: node.propertyId}]
        }]

        node.connector.client.readPropertyMultiple(
          msg.payload.deviceIPAddress || node.deviceIPAddress,
          msg.payload.requestArray || defaultRequestArray,
          options,
          function (err, value) {
            if (err) {
              node.error(err, msg)
            } else {
              bacnetCore.internalDebugLog('value: ', value)
              msg.input = msg.payload
              msg.payload = value
              node.send(msg)
            }
          })
      } else {
        bacnetCore.internalDebugLog('Read')

        let objectId = {
          type: node.objectType,
          instance: node.objectInstance
        }

        node.connector.client.readProperty(
          msg.payload.deviceIPAddress || node.deviceIPAddress,
          msg.payload.objectId || objectId,
          msg.payload.propertyId || node.propertyId,
          options,
          function (err, value) {
            if (err) {
              node.error(err, msg)
            } else {
              bacnetCore.internalDebugLog('value: ', value)
              msg.input = msg.payload
              msg.payload = value
              node.send(msg)
            }
          })
      }
    })
  }

  RED.nodes.registerType('BACnet-Read', BACnetRead)
}
