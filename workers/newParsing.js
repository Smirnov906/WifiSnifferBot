module.exports = {
newParsing}
const pcapp = require('pcap-parser')
const User = require('../models/user')
const Unknown = require('../models/unknown')
const mongoose = require('mongoose')
const moment = require('moment')
const async = require('async')
const fs = require('fs');
const path = require('path');

let currentDay = moment().format('DD.MM.YYYY')
mongoose.connect('mongodb://localhost:27017/Analysis')
function newParsing (fileName,next) {
    console.log(fileName);
  let parser = pcapp.parse(fileName)
  let tmp = []
  let macAddressArray = {}

  parser.on('packet', (packet) => {     
    //fs.appendFile('filename.log',fileName + '\n');         
    let macAddress = packet.data.toString('hex').substr(56).slice(0, 12)
    let macAddress1 = packet.data.toString('hex').substr(44).slice(0, 12)
    let time = packet.header.timestampSeconds
    let obj = {
      macAddress: macAddress,
      time: time
    }
    let obj1 = {
      macAddress: macAddress1,
      time: time
    }
    tmp.push(obj)
    tmp.push(obj1)

    macAddressArray = removeDuplicates(tmp, 'macAddress')
  })
  parser.on('end', () => {

    async.each(macAddressArray, (item, callback) => {
      User.findOne({ macAddress: item.macAddress }, (err, usr) => {
        if (err || !usr) {
            callback()
        }else {
          if (usr.status.onWork) {
            usr.status.lastContact = moment(item.time * 1000).add(2, 'hours').format('HH:mm')
            usr.save()
            callback()
          } else {
            usr.status.date = moment(item.time * 1000).format('DD.MM.YY')
            usr.status.lastContact = moment(item.time * 1000).add(2, 'hours').format('HH:mm')
            usr.status.onWork = true
            usr.status.timeFirstSeen = moment(item.time * 1000).add(2, 'hours').format('HH:mm')
            usr.save()
            callback()
          }
        }
      })
    }, () => {
        next();
    })
  })
}

function removeDuplicates (myArr, prop) {
  return myArr.filter((obj, pos, arr) => {
    return arr.map(mapObj => mapObj[prop]).indexOf(obj[prop]) === pos
  })
}
// newParsing('/Users/maxsimsmirnov/Desktop/work/JetTeam/JetBott/wifisnifferbot/workers/parsing_data/out10.cap',() => {
//     console.log('finish')
// });
