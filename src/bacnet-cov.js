/*
 node-red-contrib-bacnet
 */
'use strict'

module.exports = function (RED) {
  const bacnetCore = require('./core/bacnet-core')

  let nextProcessId = 1

  function BACnetCOV (config) {
    RED.nodes.createNode(this, config)

    this.name = config.name
    this.objectType = parseInt(config.objectType)
    this.subscriberProcessId = nextProcessId++
    this.covType = config.covType
    this.lifetime = parseInt(config.lifetime) || 0

    this.instance = RED.nodes.getNode(config.instance)
    this.objectInstance = parseInt(this.instance.instanceAddress) || 0

    this.device = RED.nodes.getNode(config.device)
    this.deviceIPAddress = this.device.deviceAddress || '127.0.0.1'

    this.connector = RED.nodes.getNode(config.server)

    const node = this

    node.status({ fill: 'yellow', shape: 'dot', text: 'subscribing' })

    if (!node.connector) {
      node.error(new Error('Client Not Ready To Subscribe COV'))
      return
    }

    node.extractPresentValue = function (data) {
      const covData = data.payload || data
      let presentValue = null

      if (covData.values && covData.values.length) {
        for (let i = 0; i < covData.values.length; i++) {
          if (covData.values[i].property && covData.values[i].property.id === 85) {
            const valArr = covData.values[i].value
            if (valArr && valArr.length) {
              presentValue = valArr[0].value
            }
            break
          }
        }
      }

      return {
        payload: presentValue,
        topic: node.name || 'BACnet COV',
        covData: covData
      }
    }

    node.covNotifyHandler = function (data) {
      const covData = data.payload || data
      if (covData.subscriberProcessId !== node.subscriberProcessId) {
        return
      }
      node.send(node.extractPresentValue(data))
    }

    node.covNotifyConfirmedHandler = function (data) {
      const covData = data.payload || data
      if (covData.subscriberProcessId !== node.subscriberProcessId) {
        return
      }
      node.send(node.extractPresentValue(data))
    }

    node.connector.client.on('covNotifyUnconfirmed', node.covNotifyHandler)
    node.connector.client.on('covNotify', node.covNotifyConfirmedHandler)

    node.renewSubscription = function () {
      node.connector.client.subscribeCov(
        node.deviceIPAddress,
        { type: node.objectType, instance: node.objectInstance },
        node.subscriberProcessId,
        false,
        node.covType === 'confirmed',
        node.lifetime,
        function (err) {
          if (err) {
            const translatedError = bacnetCore.translateErrorMessage(err)
            bacnetCore.internalDebugLog(translatedError)
            node.error(translatedError)
            node.status({ fill: 'red', shape: 'dot', text: 'error' })
          } else {
            node.status({ fill: 'green', shape: 'dot', text: 'subscribed' })
          }
        })
    }

    node.connector.client.subscribeCov(
      node.deviceIPAddress,
      { type: node.objectType, instance: node.objectInstance },
      node.subscriberProcessId,
      false,
      node.covType === 'confirmed',
      node.lifetime,
      function (err) {
        if (err) {
          const translatedError = bacnetCore.translateErrorMessage(err)
          bacnetCore.internalDebugLog(translatedError)
          node.error(translatedError)
          node.status({ fill: 'red', shape: 'dot', text: 'error' })
        } else {
          node.status({ fill: 'green', shape: 'dot', text: 'subscribed' })
          if (node.lifetime > 0) {
            const renewInterval = Math.max((node.lifetime - 30) * 1000, 30000)
            node.renewTimer = setInterval(node.renewSubscription, renewInterval)
          }
        }
      })

    node.on('input', function (msg) {
      if (!node.connector) {
        node.error(new Error('Client Not Ready To Subscribe COV'), msg)
        return
      }

      const deviceIPAddress = msg.payload.deviceIPAddress || node.deviceIPAddress
      const objectId = msg.payload.objectId || { type: node.objectType, instance: node.objectInstance }

      if (msg.payload.cancel) {
        node.connector.client.subscribeCov(
          deviceIPAddress,
          objectId,
          node.subscriberProcessId,
          true,
          node.covType === 'confirmed',
          node.lifetime,
          function (err) {
            if (err) {
              const translatedError = bacnetCore.translateErrorMessage(err)
              bacnetCore.internalDebugLog(translatedError)
              node.error(translatedError, msg)
              node.status({ fill: 'red', shape: 'dot', text: 'error' })
            }
          })
      } else if (msg.payload.subscribe) {
        node.connector.client.subscribeCov(
          deviceIPAddress,
          objectId,
          node.subscriberProcessId,
          false,
          node.covType === 'confirmed',
          node.lifetime,
          function (err) {
            if (err) {
              const translatedError = bacnetCore.translateErrorMessage(err)
              bacnetCore.internalDebugLog(translatedError)
              node.error(translatedError, msg)
              node.status({ fill: 'red', shape: 'dot', text: 'error' })
            } else {
              node.status({ fill: 'green', shape: 'dot', text: 'subscribed' })
            }
          })
      }
    })

    node.on('close', function (done) {
      if (node.renewTimer) {
        clearInterval(node.renewTimer)
        node.renewTimer = null
      }
      if (node.connector && node.connector.client) {
        node.connector.client.subscribeCov(
          node.deviceIPAddress,
          { type: node.objectType, instance: node.objectInstance },
          node.subscriberProcessId,
          true,
          node.covType === 'confirmed',
          node.lifetime,
          function (err) {
            if (err) {
              bacnetCore.internalDebugLog(err)
            }
            node.connector.client.removeListener('covNotifyUnconfirmed', node.covNotifyHandler)
            node.connector.client.removeListener('covNotify', node.covNotifyConfirmedHandler)
            done()
          })
      } else {
        done()
      }
    })
  }

  RED.nodes.registerType('BACnet-COV', BACnetCOV)
}