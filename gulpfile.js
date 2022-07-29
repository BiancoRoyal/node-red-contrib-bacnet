/**
 Copyright (c) 2017,2018,2019,2020,2021,2022 Klaus Landsdorf (http://node-red.plus/)
 All rights reserved.
 node-red-contrib-bacnet - The BSD 3-Clause License

 **/

'use strict'

const { series, src, dest } = require('gulp')
const htmlmin = require('gulp-htmlmin')
const jsdoc = require('gulp-jsdoc3')
const clean = require('gulp-clean')
const uglify = require('gulp-uglify')
const babel = require('gulp-babel')
const sourcemaps = require('gulp-sourcemaps')
const pump = require('pump')
const replace = require('gulp-replace')

function releaseIcons () {
  return src('src/icons/**/*').pipe(dest('bacnet/icons'))
}

function docIcons () {
  return src('src/icons/**/*').pipe(dest('docs/gen/icons'))
}

function docImages () {
  return src('images/**/*').pipe(dest('docs/gen/images'))
}

function releaseLocal () {
  return src('src/locales/**/*').pipe(dest('bacnet/locales'))
}

function releasePublicData () {
  return src('src/public/**/*').pipe(dest('bacnet/public'))
}

function cleanProject () {
  return src(['bacnet', 'docs/gen', 'jcoverage'], { allowEmpty: true })
    .pipe(clean({ force: true }))
}

function releaseWebContent () {
  return src('src/*.htm*')
    .pipe(htmlmin({
      minifyJS: true,
      minifyCSS: true,
      minifyURLs: true,
      maxLineLength: 120,
      preserveLineBreaks: false,
      collapseWhitespace: true,
      collapseInlineTagWhitespace: true,
      conservativeCollapse: true,
      processScripts: ['text/x-red'],
      quoteCharacter: "'"
    }))
    .pipe(dest('bacnet'))
}

function releaseJSContent (cb) {
  const anchor = '// SOURCE-MAP-REQUIRED'

  pump([
    src('src/**/*.js')
      .pipe(sourcemaps.init({ loadMaps: true }))
      .pipe(replace(anchor, 'require(\'source-map-support\').install()'))
      .pipe(babel({ presets: ['@babel/env'] }))
      .pipe(uglify())
      .pipe(sourcemaps.write('maps')), dest('bacnet')],
  cb)
}

function codeJSContent (cb) {
  const anchor = '// SOURCE-MAP-REQUIRED'

  pump([
    src('src/**/*.js')
      .pipe(sourcemaps.init({ loadMaps: true }))
      .pipe(replace(anchor, 'require(\'source-map-support\').install()'))
      .pipe(babel({ presets: ['@babel/env'] }))
      .pipe(sourcemaps.write('maps')), dest('code')],
  cb)
}

function doc (cb) {
  src(['README.md', 'src/**/*.js'], { read: false })
    .pipe(jsdoc(cb))
}

exports.default = series(cleanProject, releaseWebContent, releaseJSContent, codeJSContent, releaseLocal, releasePublicData, releaseIcons, doc, docIcons, docImages)
exports.clean = cleanProject
exports.build = series(cleanProject, releaseWebContent, releaseJSContent, releaseLocal, codeJSContent)
exports.buildDocs = series(doc, docIcons, docImages)
exports.publish = series(cleanProject, releaseWebContent, releaseJSContent, releaseLocal, codeJSContent, releasePublicData, releaseIcons, doc, docIcons, docImages)
