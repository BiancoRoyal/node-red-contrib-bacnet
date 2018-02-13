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
    this.propertyId = config.propertyId || 0
    this.priority = config.priority || 0
    this.invokeId = config.invokeId || null
    this.arrayIndex = config.arrayIndex || null
    this.maxSegments = config.maxSegments
    this.maxAdpu = config.maxAdpu
    this.invokeId = config.invokeId

    this.multipleWrite = config.multipleWrite

    this.connector = RED.nodes.getNode(config.server)

    let node = this

    node.status({fill: 'green', shape: 'dot', text: 'active'})

    node.on('input', function (msg) {
      if (!node.connector) {
        node.error(new Error('Client Not Ready To Read'), msg)
        return
      }

      if (!msg.payload.hasOwnProperty('values')) {
        node.error(new Error('Property values in payload not found for write operation!'))
        return
      }

      let options = msg.payload.options || null

      if (!options) {
        options = {
          maxSegments: BACnet.enum.MaxSegments.MAX_SEG65,
          maxAdpu: BACnet.enum.MaxAdpu.MAX_APDU1476,
          invokeId: node.invokeId,
          arrayIndex: node.arrayIndex, /* all */
          priority: node.priority
        }
      }

      if (node.multipleWrite) {
        bacnetCore.internalDebugLog('Multiple Write')

        node.connector.client.writePropertyMultiple(
          node.deviceIPAddress,
          msg.payload.values,
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

        node.connector.client.writeProperty(
          msg.payload.deviceIPAddress || node.deviceIPAddress,
          msg.payload.objectId || objectId,
          msg.payload.propertyId || node.propertyId,
          msg.payload.values,
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
