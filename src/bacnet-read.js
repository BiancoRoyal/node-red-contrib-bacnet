/*
 The MIT License

 Copyright (c) 2017,2018,2019,2020,2021,2022,2023,2024 Klaus Landsdorf (http://plus4nodered.com/)
 All rights reserved.
 node-red-contrib-bacnet
 */
'use strict'

module.exports = function (RED) {
  const bacnetCore = require('./core/bacnet-core')

  function BACnetRead (config) {
    RED.nodes.createNode(this, config)

    this.name = config.name
    this.objectType = parseInt(config.objectType)
    this.propertyId = parseInt(config.propertyId)
    this.multipleRead = config.multipleRead

    this.instance = RED.nodes.getNode(config.instance)
    this.objectInstance = parseInt(this.instance.instanceAddress) || 0

    this.device = RED.nodes.getNode(config.device)
    this.deviceIPAddress = this.device.deviceAddress || '127.0.0.1'

    this.connector = RED.nodes.getNode(config.server)

    const node = this

    node.status({ fill: 'green', shape: 'dot', text: 'active' })

    node.on('input', function (msg) {
      if (!node.connector) {
        node.error(new Error('Client Not Ready To Read'), msg)
        return
      }

      const options = msg.payload.options || {}

      if (node.multipleRead) {
        bacnetCore.internalDebugLog('Multiple Read')

        const defaultRequestArray = [{
          objectId: {
            type: node.objectType,
            instance: parseInt(node.objectInstance)
          },
          properties: [{ id: parseInt(node.propertyId) }]
        }]

        try {
          bacnetCore.internalDebugLog('readProperty node.deviceIPAddress: ' + node.deviceIPAddress)
          bacnetCore.internalDebugLog('readProperty msg.payload.deviceIPAddress: ' + msg.payload.deviceIPAddress)
          bacnetCore.internalDebugLog('readPropertyMultiple default requestArray: ' + JSON.stringify(defaultRequestArray))
          bacnetCore.internalDebugLog('readPropertyMultiple msg.payload.requestArray: ' + JSON.stringify(msg.payload.requestArray))
          bacnetCore.internalDebugLog('readPropertyMultiple node.propertyId: ' + node.propertyId)
          bacnetCore.internalDebugLog('readPropertyMultiple msg.payload.propertyId: ' + msg.payload.propertyId)
        } catch (e) {
          bacnetCore.internalDebugLog('readPropertyMultiple error: ' + e)
        }

        node.connector.client.readPropertyMultiple(
          msg.payload.deviceIPAddress || node.deviceIPAddress,
          msg.payload.requestArray || defaultRequestArray,
          options,
          function (err, result) {
            if (err) {
              const translatedError = bacnetCore.translateErrorMessage(err)
              bacnetCore.internalDebugLog(translatedError)
              node.error(translatedError, msg)
            } else {
              msg.input = msg.payload
              msg.payload = result
              node.send(msg)
            }
          })
      } else {
        bacnetCore.internalDebugLog('Read')

        const objectId = {
          type: parseInt(node.objectType),
          instance: parseInt(node.objectInstance)
        }

        try {
          bacnetCore.internalDebugLog('readProperty node.deviceIPAddress: ' + node.deviceIPAddress)
          bacnetCore.internalDebugLog('readProperty msg.payload.deviceIPAddress: ' + msg.payload.deviceIPAddress)
          bacnetCore.internalDebugLog('readProperty default objectId: ' + JSON.stringify(objectId))
          bacnetCore.internalDebugLog('readProperty msg.payload.objectId: ' + JSON.stringify(msg.payload.objectId))
          bacnetCore.internalDebugLog('readProperty node.propertyId: ' + node.propertyId)
          bacnetCore.internalDebugLog('readProperty msg.payload.propertyId: ' + msg.payload.propertyId)
        } catch (e) {
          bacnetCore.internalDebugLog('readProperty error: ' + e)
        }

        node.connector.client.readProperty(
          msg.payload.deviceIPAddress || node.deviceIPAddress,
          msg.payload.objectId || objectId,
          parseInt(msg.payload.propertyId) || parseInt(node.propertyId),
          options,
          function (err, result) {
            if (err) {
              const translatedError = bacnetCore.translateErrorMessage(err)
              bacnetCore.internalDebugLog(translatedError)
              node.error(translatedError, msg)
            } else {
              msg.input = msg.payload
              msg.payload = result
              node.send(msg)
            }
          })
      }
    })
  }

  RED.nodes.registerType('BACnet-Read', BACnetRead)
}
