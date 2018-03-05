const pcapp = require('pcap-parser')
const User = require('../models/user')
const Unknown = require('../models/unknown')
const mongoose = require('mongoose')
const moment = require('moment')
const async = require('async')
const fs = require('fs');

mongoose.connect('mongodb://localhost:27017/Analysis').then((res) => {  
  Parse();
  
})

function removeDuplicates (myArr, prop) {
  return myArr.filter((obj, pos, arr) => {
    return arr.map(mapObj => mapObj[prop]).indexOf(obj[prop]) === pos
  })
}
function Parse () {
    let path = __dirname+'/parsing_data/out0.cap';
    let packetNumber = 1
    let parser = pcapp.parse(path)
    fs.appendFile('path.log',path + '\n');

    let tmp = []
    let macAddressArray = {}

    parser.on('packet', (packet) => {
      
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
      //console.log(macAddressArray)
      //fs.appendFile('arr.log',JSON.stringify(macAddressArray));
      async.each(macAddressArray, (item, callback) => {
        User.findOne({ macAddress: item.macAddress }, (err, usr) => {
          if (err || !usr) {
            callback();
          } 
          else {
            if (usr.status.onWork) {
              usr.status.lastContact = moment(item.time * 1000).add(2,'hours').format('HH:mm')
              usr.save()
              callback()
            } else {
              usr.status.date = moment(item.time * 1000).format('DD.MM.YY')
              usr.status.lastContact = moment(item.time * 1000).add(2,'hours').format('HH:mm')
              usr.status.onWork = true
              usr.status.timeFirstSeen = moment(item.time * 1000).add(2,'hours').format('HH:mm')
              usr.save()
              callback()
            }
          }
        })
      }, (err) => {
        process.exit(0);
      })
    })
}



module.exports = {
Parse,
}
