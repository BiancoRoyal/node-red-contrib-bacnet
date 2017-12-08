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

  function BACnetWrite (config) {
    RED.nodes.createNode(this, config)
    this.name = config.name
    this.requestType = config.requestType || 8
    this.requestInstance = config.requestInstance || 4194303
    this.requestPropertyIdentifier = config.requestPropertyIdentifier || 8
    this.requestPropertyArrayIndex = config.requestPropertyArrayIndex || 12
    this.requestPriority = config.requestPriority || 8
    this.deviceIPAddress = config.deviceIPAddress || '127.0.0.1'

    this.connector = RED.nodes.getNode(config.server)

    let node = this

    node.status({fill: 'green', shape: 'dot', text: 'active'})

    node.on('input', function (msg) {
      let valueList = [
        {objectIdentifier: {type: node.requestType, instance: node.requestInstance},
          values: [
            {property: {propertyIdentifier: node.requestPropertyIdentifier,
              propertyArrayIndex: node.requestPropertyArrayIndex},
              value: [{type: BACnet.enum.BacnetApplicationTags.BACNET_APPLICATION_TAG_BOOLEAN, value: true}],
              priority: node.requestPriority}
          ]}
      ]
      node.connector.client.writePropertyMultiple(node.deviceIPAddress, valueList, function (err, value) {
        if (err) {
          node.error(err, msg)
        } else {
          bacnetCore.internalDebugLog('value: ', value)
          msg.payload = value
          node.send(msg)
        }
      })
    })
  }

  RED.nodes.registerType('BACnet-Write', BACnetWrite)
}
