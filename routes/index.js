const express = require('express')
const router = express.Router()
const pcapp = require('pcap-parser')
const User = require('../models/user')
const Unknown = require('../models/unknown')
const mongoose = require('mongoose')
const async = require('async')
const moment = require('moment')
const arp = require('node-arp')
const parse = require('../workers/parse')
const scp = require('../workers/scp')
const Bot = require('../workers/bot')

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' })
})
router.get('/getUnknown', (req, res, next) => {
  Unknown.find({}, (err, doc) => {
    res.json(doc)
  })
})

router.get('/getUsers', (req, res, next) => {
  User.find({}).sort('-status.onWork').exec((err, result) => {
    if (err) return res.json(err)
    res.json(result)
  })
})
router.get('/test', (req, res, next) => {
  let ip = req.connection.remoteAddress.substr(7)
  arp.getMAC(ip, (err, mac) => {
    if (err) return console.log(err)
    res.render('test', {
      ip: ip,
      mac: mac
    })
  })
})

router.get('/api/users', (req, res, next) => {
  if (req.device.type === 'phone') {
    let userId = req.param('id')
    let username = req.param('fname') + ' ' + req.param('lname')
    let ip = req.connection.remoteAddress.substr(7)
    arp.getMAC(ip, (err, mac) => {
      if(err) return res.json(err);
      let obj = {
        userID: userId,
        username: username,
        ip: ip,
        mac: mac.replace(/:([^:]{1}$)/g, ':0$1').replace(/:/g, '')
      }
      User.findOne({macAddress: obj.mac.replace(/:/g, '')}, (err, usr) => {
        if (err) return res.json(err)
        if (!usr) {
          let newUser = new User({
            name: obj.username,
            macAddress: obj.mac,
            telegramID: obj.userID
          }).save((err, doc) => {
            if (err) return res.json(err)
            res.json('nice')
          })
        } else res.json('Вы уже зарегистрированы')
      })
    })
  } else res.json('Только с мобильных устройств')
})
router.post('/api/mobile',(req,res,next) => {
  let { ssid, ip,date,time } = req.body;
  if(ip) {
    arp.getMAC(ip, (err, mac) => {
      console.log("SSID: ", ssid + ' \n' + "IP: ", ip + '\n' + "MAC: " + mac.replace(/:([^:]{1}$)/g, ':0$1').replace(/:/g, '')  );
      //mac.replace(/:([^:]{1}$)/g, ':0$1').replace(/:/g, '')
      User.findOne({macAddress: mac.replace(/:([^:]{1}$)/g, ':0$1').replace(/:/g, '')},(err,usr) => {
        if(err) return res.json(err);
        if(usr.status.onWork) {
          usr.status.lastContact = time;
          usr.save()
          res.json('suc');          
        } else {
          usr.status.date = date;
          usr.status.lastContact = time;
          usr.status.onWork = true
          usr.status.timeFirstSeen = time;
          usr.save()
          res.json('suc');
        }
      })
    })
  } else res.json('Error')

})
module.exports = router
