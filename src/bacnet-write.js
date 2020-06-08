/*
 The MIT License

 Copyright (c) 2017,2018,2019,2020 Klaus Landsdorf (https://osi.bianco-royal.com/)
 All rights reserved.
 node-red-contrib-bacnet
 */
'use strict'

module.exports = function (RED) {
  const bacnetCore = require('./core/bacnet-core')
  const BACnet = require('node-bacnet')
  const _ = require('underscore')

  function BACnetWrite (config) {
    RED.nodes.createNode(this, config)

    this.name = config.name
    this.objectType = parseInt(config.objectType)
    this.valueTag = parseInt(config.valueTag)
    this.valueValue = config.valueValue
    this.propertyId = parseInt(config.propertyId)
    this.priority = Math.min(Math.max((parseInt(config.priority) || 15), 1), 16)

    this.multipleWrite = config.multipleWrite

    this.instance = RED.nodes.getNode(config.instance)
    this.objectInstance = this.instance.instanceAddress || 0

    this.device = RED.nodes.getNode(config.device)
    this.deviceIPAddress = this.device.deviceAddress || '127.0.0.1' // IPv6 it is :: - but configure Node-RED too

    this.connector = RED.nodes.getNode(config.server)

    const node = this

    node.status({ fill: 'green', shape: 'dot', text: 'active' })

    node.on('input', function (msg) {
      if (!node.connector) {
        node.error(new Error('Client Not Ready To Write'), msg)
        return
      }

      const options = msg.payload.options || {priority:node.priority}

      if (node.multipleWrite) {
        bacnetCore.internalDebugLog('Multiple Write')

        if (!msg.payload.values || !msg.payload.values[0].values) {
          node.error(new Error('msg.payload.values missing or invalid array for multiple write'), msg)
          return
        }

        msg.payload.values.forEach(function (item) {
          if (!item.objectId) {
            item.objectId = {
              type: node.objectType,
              instance: parseInt(node.objectInstance)
            }
          }
        })

        try {
          bacnetCore.internalDebugLog('writePropertyMultiple msg.payload.values: ' + JSON.stringify(msg.payload.values))
        } catch (e) {
          bacnetCore.internalDebugLog('writePropertyMultiple error: ' + e)
        }

        node.connector.client.writePropertyMultiple(
          msg.payload.deviceIPAddress || node.deviceIPAddress,
          msg.payload.values,
          options,
          function (err, value) {
            if (err) {
              const translatedError = bacnetCore.translateErrorMessage(err)
              bacnetCore.internalDebugLog(translatedError)
              node.error(translatedError, msg)
            } else {
              msg.input = msg.payload
              msg.payload = value
              node.send(msg)
            }
          })
      } else {
        bacnetCore.internalDebugLog('Write')

        if (msg.payload.values && !msg.payload.values[0]) {
          node.error(new Error('invalid msg.payload.values array for write'), msg)
          return
        }

        const objectId = {
          type: node.objectType,
          instance: parseInt(node.objectInstance)
        }

        const defaultValues = [{
          type: node.valueTag,
          value: node.valueValue
        }]

        try {
          bacnetCore.internalDebugLog('readProperty default objectId: ' + JSON.stringify(objectId))
          bacnetCore.internalDebugLog('writeProperty default values: ' + JSON.stringify(defaultValues))
          bacnetCore.internalDebugLog('writeProperty msg.payload.values: ' + JSON.stringify(msg.payload.values))
          bacnetCore.internalDebugLog('writeProperty node.propertyId: ' + node.propertyId)
        } catch (e) {
          bacnetCore.internalDebugLog('writeProperty error: ' + e)
        }

        node.connector.client.writeProperty(
          msg.payload.deviceIPAddress || node.deviceIPAddress,
          msg.payload.objectId || objectId,
          msg.payload.propertyId || node.propertyId,
          msg.payload.values || defaultValues,
          options,
          function (err, value) {
            if (err) {
              const translatedError = bacnetCore.translateErrorMessage(err)
              bacnetCore.internalDebugLog(translatedError)
              node.error(translatedError, msg)
            } else {
              msg.input = msg.payload
              msg.payload = value
              node.send(msg)
            }
          })
      }
    })
  }

  RED.nodes.registerType('BACnet-Write', BACnetWrite)

  RED.httpAdmin.get('/bacnet/ApplicationTags', RED.auth.needsPermission('bacnet.CMD.write'), function (req, res) {
    const typeList = BACnet.enum.ApplicationTag
    const invertedTypeList = _.toArray(_.invert(typeList))
    const resultTypeList = []

    let typelistEntry
    for (typelistEntry of invertedTypeList) {
      resultTypeList.push({ typeValue: typeList[typelistEntry], label: typelistEntry })
    }

    res.json(resultTypeList)
  })

  RED.httpAdmin.get('/bacnet/PropertyIds', RED.auth.needsPermission('bacnet.CMD.write'), function (req, res) {
    const typeList = BACnet.enum.PropertyIdentifier
    const invertedTypeList = _.toArray(_.invert(typeList))
    const resultTypeList = []

    let typelistEntry
    for (typelistEntry of invertedTypeList) {
      resultTypeList.push({ typeValue: typeList[typelistEntry], label: typelistEntry })
    }

    res.json(resultTypeList)
  })

  RED.httpAdmin.get('/bacnet/ObjectTypes', RED.auth.needsPermission('bacnet.CMD.write'), function (req, res) {
    const typeList = BACnet.enum.ObjectType
    const invertedTypeList = _.toArray(_.invert(typeList))
    const resultTypeList = []

    let typelistEntry
    for (typelistEntry of invertedTypeList) {
      resultTypeList.push({ typeValue: typeList[typelistEntry], label: typelistEntry })
    }

    res.json(resultTypeList)
  })
}
