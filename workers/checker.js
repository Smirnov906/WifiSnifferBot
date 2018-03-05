const Agenda = require('agenda');
const Agendash = require('agendash');
const _ = require('lodash');
const async = require('async');
const moment = require('moment');
const bot = require('./bot').bot;

const User = require('../models/user');
const config = require('../config');

const agenda = new Agenda({db: {address: config.mongoUrl,collection: 'agenda' }});

exports.Agendash = Agendash((agenda));


agenda.define('new day', (job, done) => {
    User.find({},(err, users) => {
        async.each(users,item => {
            let obj = {
                date: item.status.date,
                cameTime: item.status.timeFirstSeen,
                leftTime: item.status.leftTime
            };
           item.history.push(obj);
           item.save();
           item.status.onWork = false;
           item.status.date = '';
           item.status.lastContact = '';
           item.status.timeFirstSeen = ''; 
           item.save();
        });
        done();
    });
});
agenda.define('send message',(job,done) => {
    User.find({'status.onWork':true,messageSent: false},(err, users) => {
        if(err) return console.log(err);
        async.each(users,(item, next) => {
            bot.telegram.sendMessage(item.telegramID,'Вы пришли на работу в ' + item.status.timeFirstSeen);
            item.messageSent = true;
            item.save();
        });
        done();
    })
})
agenda.on('ready', () => {    
//    let newDay = agenda.create('new day');
//    newDay.repeatEvery('0 0 00 * * *', {
//        timezone: 'Asia/Yekaterinburg'
//    });
//    newDay.save((err,doc) => {
//        if(err) return console.log(err);
//        return;
//    });
//    agenda.every('second','send message');
     agenda.start();
  });
