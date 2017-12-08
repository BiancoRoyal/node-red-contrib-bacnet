/*
 The MIT License

 Copyright (c) 2017 - Klaus Landsdorf (http://bianco-royal.de/)
  All rights reserved.
 node-red-contrib-bacnet
 */
'use strict'

var assert = require('chai').assert

describe('Array', function () {
  describe('#indexOf()', function () {
    it('should return -1 when the value is not present', function (done) {
      assert.equal(-1, [1, 2, 3].indexOf(5))
      assert.equal(-1, [1, 2, 3].indexOf(0))
      assert.equal(1, [1, 2, 3].indexOf(2))

      done()
    })

    it('should return index when the value is present', function (done) {
      assert.equal(0, [1, 2, 3].indexOf(1))
      assert.equal(1, [1, 2, 3].indexOf(2))
      assert.equal(2, [1, 2, 3].indexOf(3))

      done()
    })

    it('should work with assert', function () {
      assert.notEqual(4, 5)
      assert.equal(5, 5)
    })
  })
})

describe('Array index of', function () {
  describe('#indexOf()', function () {
    it('should return -1 when the value is not present', function () {
      assert.equal(-1, [1, 2, 3].indexOf(4))
    })
  })
})
