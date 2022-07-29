/*
 The MIT License

 Copyright (c) 2017,2018,2019,2020,2021,2022 Klaus Landsdorf (http://node-red.plus/)
 All rights reserved.
 node-red-contrib-bacnet
 */
'use strict'

module.exports = function (RED) {
  const bacnetCore = require('./core/bacnet-core')
  const BACnet = require('node-bacnet')
  const _ = require('underscore')

  function BACnetCommand (config) {
    RED.nodes.createNode(this, config)

    this.name = config.name
    this.commandType = config.commandType
    this.timeDuration = parseInt(config.timeDuration) || 0
    this.enableDisable = config.enableDisable || BACnet.enum.EnableDisable.ENABLE
    this.deviceState = config.deviceState || BACnet.enum.ReinitializedState.COLDSTART
    this.isUtc = config.isUtc || true
    this.lowLimit = config.lowLimit || null
    this.highLimit = config.highLimit || null
    this.credentials = config.credentials

    this.device = RED.nodes.getNode(config.device)
    this.deviceIPAddress = this.device.deviceAddress || '127.0.0.1'

    this.connector = RED.nodes.getNode(config.server)

    const node = this

    node.status({ fill: 'green', shape: 'dot', text: 'active' })

    node.on('input', function (msg) {
      if (!node.connector) {
        node.error(new Error('Client Not Ready To Read'), msg)
      }

      bacnetCore.internalDebugLog('Command')

      const commandType = msg.payload.commandType || node.commandType
      let options = msg.payload.options || null

      if (!options) {
        options = {
          maxSegments: BACnet.enum.MaxSegmentsAccepted.SEGMENTS_65,
          maxAdpu: BACnet.enum.MaxApduLengthAccepted.OCTETS_1476,
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
                const translatedError = bacnetCore.translateErrorMessage(err)
                bacnetCore.internalDebugLog(translatedError)
                node.error(translatedError, msg)
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
                const translatedError = bacnetCore.translateErrorMessage(err)
                bacnetCore.internalDebugLog(translatedError)
                node.error(translatedError, msg)
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
    const typeList = BACnet.enum.EnableDisable
    const invertedTypeList = _.toArray(_.invert(typeList))
    const resultTypeList = []

    let typelistEntry
    for (typelistEntry of invertedTypeList) {
      resultTypeList.push({ typeValue: typeList[typelistEntry], label: typelistEntry })
    }

    res.json(resultTypeList)
  })

  RED.httpAdmin.get('/bacnet/BacnetReinitializedStates', RED.auth.needsPermission('bacnet.CMD.read'), function (req, res) {
    const typeList = BACnet.enum.ReinitializedState
    const invertedTypeList = _.toArray(_.invert(typeList))
    const resultTypeList = []

    let typelistEntry
    for (typelistEntry of invertedTypeList) {
      resultTypeList.push({ typeValue: typeList[typelistEntry], label: typelistEntry })
    }

    res.json(resultTypeList)
  })
}
