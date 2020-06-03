/*
 The MIT License

 Copyright (c) 2017,2018,2019,2020 Klaus Landsdorf (https://osi.bianco-royal.com/)
 All rights reserved.
 node-red-contrib-bacnet
 */
'use strict'

var de = de || { biancoroyal: { bacnet: { core: {} } } } // eslint-disable-line no-use-before-define
de.biancoroyal.bacnet.core.internalDebugLog = de.biancoroyal.bacnet.core.internalDebugLog || require('debug')('bacnet:nodered:core') // eslint-disable-line no-use-before-define
de.biancoroyal.bacnet.core.detailDebugLog = de.biancoroyal.bacnet.core.detailDebugLog || require('debug')('bacnet:nodered:core:details') // eslint-disable-line no-use-before-define
de.biancoroyal.bacnet.core.specialDebugLog = de.biancoroyal.bacnet.core.specialDebugLog || require('debug')('bacnet:nodered:core:special') // eslint-disable-line no-use-before-define
de.biancoroyal.bacnet.core.errorCodeList = de.biancoroyal.bacnet.core.errorCodeList || [] // eslint-disable-line no-use-before-define
de.biancoroyal.bacnet.core.errorClassList = de.biancoroyal.bacnet.core.errorClassList || [] // eslint-disable-line no-use-before-define

de.biancoroyal.bacnet.core.initCodeLists = function () {
  const BACnet = require('node-bacnet')
  const _ = require('underscore')

  const errorCodeList = BACnet.enum.ErrorCode
  const invertedErrorCodeList = _.toArray(_.invert(errorCodeList))
  de.biancoroyal.bacnet.core.errorCodeList = []

  let listCodeEntry
  for (listCodeEntry of invertedErrorCodeList) {
    de.biancoroyal.bacnet.core.errorCodeList.push({ typeValue: errorCodeList[listCodeEntry], label: listCodeEntry })
  }
  _.sortBy(de.biancoroyal.bacnet.core.errorCodeList, 'typeValue')

  const errorClassList = BACnet.enum.ErrorClass
  const invertedErrorClassList = _.toArray(_.invert(errorClassList))
  de.biancoroyal.bacnet.core.errorClassList = []

  let listClassEntry
  for (listClassEntry of invertedErrorClassList) {
    de.biancoroyal.bacnet.core.errorClassList.push({ typeValue: errorClassList[listClassEntry], label: listClassEntry })
  }
  _.sortBy(de.biancoroyal.bacnet.core.errorClassList, 'typeValue')

  de.biancoroyal.bacnet.core.internalDebugLog('List init done with ' +
    de.biancoroyal.bacnet.core.errorClassList.length + ' class errors and ' +
    de.biancoroyal.bacnet.core.errorCodeList.length + ' code errors')
}

de.biancoroyal.bacnet.core.translateErrorMessage = function (err) {
  const message = err.message
  const messageParts = message.split('-')
  if (messageParts.length === 3) {
    const errorClassMessage = messageParts[1].split(':')
    const errorCodeMessage = messageParts[2].split(':')

    de.biancoroyal.bacnet.core.internalDebugLog(errorClassMessage)
    de.biancoroyal.bacnet.core.internalDebugLog(errorCodeMessage)

    errorClassMessage[1] = de.biancoroyal.bacnet.core.errorClassToString(errorClassMessage[1])
    errorCodeMessage[1] = de.biancoroyal.bacnet.core.errorCodeToString(errorCodeMessage[1])

    err.message = message + ' ' + errorClassMessage.join(':') + ' ' + errorCodeMessage.join(':')
  }
  return err
}

de.biancoroyal.bacnet.core.errorCodeToString = function (errorCodeId) {
  if (de.biancoroyal.bacnet.core.errorCodeList.length < 1) {
    de.biancoroyal.bacnet.core.initCodeLists()
  }
  let listEntry, entry
  for (listEntry of de.biancoroyal.bacnet.core.errorCodeList) {
    if (parseInt(listEntry.typeValue) === parseInt(errorCodeId)) {
      de.biancoroyal.bacnet.core.detailDebugLog(listEntry.typeValue + ' --> ' + listEntry.label)
      entry = listEntry
    }
  }
  return (entry) ? entry.label : errorCodeId
}

de.biancoroyal.bacnet.core.errorClassToString = function (errorClassId) {
  if (de.biancoroyal.bacnet.core.errorClassList.length < 1) {
    de.biancoroyal.bacnet.core.initCodeLists()
  }
  let listEntry, entry
  for (listEntry of de.biancoroyal.bacnet.core.errorClassList) {
    if (parseInt(listEntry.typeValue) === parseInt(errorClassId)) {
      de.biancoroyal.bacnet.core.detailDebugLog(listEntry.typeValue + ' --> ' + listEntry.label)
      entry = listEntry
    }
  }
  return (entry) ? entry.label : errorClassId
}

module.exports = de.biancoroyal.bacnet.core
