/*
 The MIT License

 Copyright (c) 2017 - Klaus Landsdorf (http://bianco-royal.de/)
 All rights reserved.
 node-red-contrib-bacnet
 */
'use strict'

var de = de || {biancoroyal: {bacnet: {core: {}}}} // eslint-disable-line no-use-before-define
de.biancoroyal.bacnet.core.internalDebugLog = de.biancoroyal.bacnet.core.internalDebugLog || require('debug')('bacnet:core') // eslint-disable-line no-use-before-define
de.biancoroyal.bacnet.core.detailDebugLog = de.biancoroyal.bacnet.core.detailDebugLog || require('debug')('bacnet:core:details') // eslint-disable-line no-use-before-define
de.biancoroyal.bacnet.core.specialDebugLog = de.biancoroyal.bacnet.core.specialDebugLog || require('debug')('bacnet:core:special') // eslint-disable-line no-use-before-define

module.exports = de.biancoroyal.bacnet.core
