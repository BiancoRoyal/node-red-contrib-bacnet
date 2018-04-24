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
  let _ = require('underscore')

  function BACnetWrite (config) {
    RED.nodes.createNode(this, config)

    this.name = config.name

    this.deviceIPAddress = config.deviceIPAddress || '127.0.0.1'
    this.objectType = config.objectType || 0
    this.objectInstance = config.objectInstance || 0
    this.valueTag = config.valueTag || 9
    this.valueValue = config.valueValue || null
    this.propertyId = config.propertyId || 0
    this.priority = config.priority || 15
    this.invokeId = config.invokeId || null
    this.arrayIndex = config.arrayIndex || 0xFFFFFFFF
    this.maxSegments = config.maxSegments
    this.maxAdpu = config.maxAdpu
    this.invokeId = config.invokeId

    this.multipleWrite = config.multipleWrite

    this.connector = RED.nodes.getNode(config.server)

    let node = this

    node.status({fill: 'green', shape: 'dot', text: 'active'})

    node.on('input', function (msg) {
      if (!node.connector) {
        node.error(new Error('Client Not Ready To Write'), msg)
        return
      }

      let options = msg.payload.options || {}

      if (node.multipleWrite) {
        bacnetCore.internalDebugLog('Multiple Write')

        let defaultValues = [{
          objectId: {
            type: node.objectType,
            instance: node.objectInstance
          },
          values: [{
            property: {
              id: node.propertyId,
              index: node.arrayIndex
            },
            value: [{
              type: node.valueTag,
              value: node.valueValue
            }],
            priority: node.priority
          }]
        }]

        node.connector.client.writePropertyMultiple(
          msg.payload.deviceIPAddress || node.deviceIPAddress,
          msg.payload.values || defaultValues,
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
        bacnetCore.internalDebugLog('Write')

        let objectId = {
          type: node.objectType,
          instance: node.objectInstance
        }

        let defaultValues = [{
          type: node.valueTag,
          value: node.valueValue
        }]

        node.connector.client.writeProperty(
          msg.payload.deviceIPAddress || node.deviceIPAddress,
          msg.payload.objectId || objectId,
          msg.payload.propertyId || node.propertyId,
          msg.payload.values || defaultValues,
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

  RED.nodes.registerType('BACnet-Write', BACnetWrite)

  RED.httpAdmin.get('/bacnet/ApplicationTags', RED.auth.needsPermission('bacnet.CMD.read'), function (req, res) {
    let typeList = BACnet.enum.ApplicationTags
    let invertedTypeList = _.toArray(_.invert(typeList))
    let resultTypeList = []

    let typelistEntry
    for (typelistEntry of invertedTypeList) {
      resultTypeList.push({ typeValue: typeList[typelistEntry], label: typelistEntry })
    }

    res.json(resultTypeList)
  })

  RED.httpAdmin.get('/bacnet/PropertyIds', RED.auth.needsPermission('bacnet.CMD.read'), function (req, res) {
    let typeList = BACnet.enum.PropertyIds
    let invertedTypeList = _.toArray(_.invert(typeList))
    let resultTypeList = []

    let typelistEntry
    for (typelistEntry of invertedTypeList) {
      resultTypeList.push({ typeValue: typeList[typelistEntry], label: typelistEntry })
    }

    res.json(resultTypeList)
  })

  RED.httpAdmin.get('/bacnet/ObjectTypes', RED.auth.needsPermission('bacnet.CMD.read'), function (req, res) {
    let typeList = BACnet.enum.ObjectTypes
    let invertedTypeList = _.toArray(_.invert(typeList))
    let resultTypeList = []

    let typelistEntry
    for (typelistEntry of invertedTypeList) {
      resultTypeList.push({ typeValue: typeList[typelistEntry], label: typelistEntry })
    }

    res.json(resultTypeList)
  })
}
