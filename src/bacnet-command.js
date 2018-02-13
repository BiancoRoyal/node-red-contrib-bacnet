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

  function BACnetCommand (config) {
    RED.nodes.createNode(this, config)

    this.name = config.name
    this.commandType = config.commandType
    this.timeDuration = config.timeDuration || 0
    this.enableDisable = config.enableDisable || BACnet.enum.EnableDisable.ENABLE
    this.deviceState = config.deviceState || BACnet.enum.ReinitializedStates.BACNET_REINIT_COLDSTART
    this.isUtc = config.isUtc || true
    this.lowLimit = config.lowLimit || null
    this.highLimit = config.highLimit || null
    this.deviceIPAddress = config.deviceIPAddress || '127.0.0.1'
    this.credentials = config.credentials

    this.connector = RED.nodes.getNode(config.server)

    let node = this

    node.status({fill: 'green', shape: 'dot', text: 'active'})

    node.on('input', function (msg) {
      if (!node.connector) {
        node.error(new Error('Client Not Ready To Read'), msg)
      }

      bacnetCore.internalDebugLog('Command')

      let commandType = msg.payload.commandType || node.commandType
      let options = msg.payload.options || null

      if (!options) {
        options = {
          maxSegments: BACnet.enum.MaxSegments.MAX_SEG65,
          maxAdpu: BACnet.enum.MaxAdpu.MAX_APDU1476,
          invokeId: null,
          password: (node.credentials) ? node.credentials.password : null
        }
      } else {
        if (!msg.payload.options.password) {
          msg.payload.options.password = node.credentials.password
        }
      }

      switch (commandType) {
        case 'deviceCommunicationControl':
          node.connector.client.deviceCommunicationControl(
            msg.payload.deviceIPAddress || node.deviceIPAddress,
            msg.payload.timeDuration || node.timeDuration,
            msg.payload.enableDisable || node.enableDisable,
            options,
            function (err, value) {
              if (err) {
                node.error(err, msg)
              } else {
                bacnetCore.internalDebugLog('value: ', value)
                msg.input = msg.payload
                msg.payload = value
              }
            })
          break

        case 'reinitializeDevice':
          node.connector.client.reinitializeDevice(
            msg.payload.deviceIPAddress || node.deviceIPAddress,
            msg.payload.deviceState || node.deviceState,
            options,
            function (err, value) {
              if (err) {
                node.error(err, msg)
              } else {
                bacnetCore.internalDebugLog('value: ', value)
                msg.input = msg.payload
                msg.payload = value
              }
            })
          break

        case 'timeSync':
          if (msg.payload.isUtc || node.isUtc) {
            node.connector.client.timeSyncUTC(
              msg.payload.deviceIPAddress || node.deviceIPAddress,
              msg.payload.syncDateTime || new Date())
          } else {
            node.connector.client.timeSync(
              msg.payload.deviceIPAddress || node.deviceIPAddress,
              msg.payload.syncDateTime || new Date())
          }
          break

        case 'whoIsExplicit':
          node.connector.whoIsExplicit(
            msg.payload.lowLimit || node.lowLimit,
            msg.payload.highLimit || node.highLimit,
            msg.payload.deviceIPAddress || node.deviceIPAddress,
            function () {
              msg.input = msg.payload
              msg.payload = node.connector.devices
              node.send(msg)
            })
          break

        case 'whoIs':
          node.connector.whoIs(
          function () {
            msg.input = msg.payload
            msg.payload = node.connector.devices
            node.send(msg)
          })
          break

        default:
          bacnetCore.internalDebugLog('Unknown Command Type Selected ' + commandType)
      }

      msg.devices = node.connector.devices

      node.send(msg)
    })
  }

  RED.nodes.registerType('BACnet-Command', BACnetCommand)

  RED.httpAdmin.get('/bacnet/BacnetEnableDisable', RED.auth.needsPermission('bacnet.CMD.read'), function (req, res) {
    let typeList = BACnet.enum.EnableDisable
    let invertedTypeList = _.toArray(_.invert(typeList))
    let resultTypeList = []

    let typelistEntry
    for (typelistEntry of invertedTypeList) {
      resultTypeList.push({ typeValue: typeList[typelistEntry], label: typelistEntry })
    }

    res.json(resultTypeList)
  })

  RED.httpAdmin.get('/bacnet/BacnetReinitializedStates', RED.auth.needsPermission('bacnet.CMD.read'), function (req, res) {
    let typeList = BACnet.enum.ReinitializedStates
    let invertedTypeList = _.toArray(_.invert(typeList))
    let resultTypeList = []

    let typelistEntry
    for (typelistEntry of invertedTypeList) {
      resultTypeList.push({ typeValue: typeList[typelistEntry], label: typelistEntry })
    }

    res.json(resultTypeList)
  })
}
