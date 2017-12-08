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
    this.objectType = config.objectType || 8
    this.objectInstance = config.objectInstance || 4194303
    this.propertyId = config.propertyId || 8
    this.priority = config.priority || 8

    this.multipleWrite = config.multipleWrite

    this.connector = RED.nodes.getNode(config.server)

    let node = this

    node.status({fill: 'green', shape: 'dot', text: 'active'})

    node.on('input', function (msg) {
      if (node.multipleWrite) {
        if (!msg.payload.hasOwnProperty('values') &&
          !msg.payload.hasOwnProperty('valueList')) {
          node.error(new Error('No values Or valueList In Payload found!'))
          return
        }

        let valueList = [
          {objectIdentifier: {
            type: msg.payload.objectType || node.objectType,
            instance: msg.payload.objectInstance || node.objectInstance
          },
            values: msg.payload.values
          }
        ]

        bacnetCore.internalDebugLog(valueList)

        node.connector.client.writePropertyMultiple(
          node.deviceIPAddress,
          msg.payload.valueList || valueList,
          function (err, value) {
            if (err) {
              node.error(err, msg)
            } else {
              bacnetCore.internalDebugLog('value: ', value)
              msg.payload = value
              node.send(msg)
            }
          })
      } else {
        if (!msg.payload.hasOwnProperty('valueList') &&
          !msg.payload.hasOwnProperty('bacnetValue')) {
          node.error(new Error('No bacnetValue Or valueList In Payload found!'))
          return
        }

        let valueList = [
          {type: msg.payload.bacnetValueType, value: msg.payload.bacnetValue}
        ]

        bacnetCore.internalDebugLog(valueList)

        node.connector.client.writeProperty(
          msg.payload.deviceIPAddress || node.deviceIPAddress,
          msg.payload.objectType || node.objectType,
          msg.payload.objectInstance || node.objectInstance,
          msg.payload.propertyId || node.propertyId,
          msg.payload.priority || node.priority,
          msg.payload.valueList || valueList,
          function (err, value) {
            if (err) {
              node.error(err, msg)
            } else {
              bacnetCore.internalDebugLog('value: ', value)
              msg.payload = value
              node.send(msg)
            }
          })
      }
    })
  }

  RED.nodes.registerType('BACnet-Write', BACnetWrite)

  RED.httpAdmin.get('/bacnet/ApplicationTags', RED.auth.needsPermission('bacnet.CMD.read'), function (req, res) {
    let typeList = BACnet.enum.BacnetApplicationTags
    let invertedTypeList = _.toArray(_.invert(typeList))
    let resultTypeList = []

    let typelistEntry
    for (typelistEntry of invertedTypeList) {
      resultTypeList.push({ typeValue: typeList[typelistEntry], label: typelistEntry })
    }

    res.json(resultTypeList)
  })

  RED.httpAdmin.get('/bacnet/PropertyIds', RED.auth.needsPermission('bacnet.CMD.read'), function (req, res) {
    let typeList = BACnet.enum.BacnetPropertyIds
    let invertedTypeList = _.toArray(_.invert(typeList))
    let resultTypeList = []

    let typelistEntry
    for (typelistEntry of invertedTypeList) {
      resultTypeList.push({ typeValue: typeList[typelistEntry], label: typelistEntry })
    }

    res.json(resultTypeList)
  })

  RED.httpAdmin.get('/bacnet/ObjectTypes', RED.auth.needsPermission('bacnet.CMD.read'), function (req, res) {
    let typeList = BACnet.enum.BacnetObjectTypes
    let invertedTypeList = _.toArray(_.invert(typeList))
    let resultTypeList = []

    let typelistEntry
    for (typelistEntry of invertedTypeList) {
      resultTypeList.push({ typeValue: typeList[typelistEntry], label: typelistEntry })
    }

    res.json(resultTypeList)
  })
}
