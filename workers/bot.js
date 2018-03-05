const Telegraf = require('telegraf');
const Extra = require('telegraf/extra')
const config = require('../config');

const bot = new Telegraf(config.telegramToken);
exports.bot = bot;
const markup = Extra.HTML();
bot.start((ctx) => {
    let obj = {
        telegramID: ctx.chat.id,
        firstName: ctx.from.first_name,
        lastName: ctx.from.last_name
    }
    //ctx.reply(`<a href="http://10.66.81.142:20000/api/users?id=${obj.telegramID}&fname=${obj.firstName}&lname=${obj.lastName}" >CLICK</a>`,markup)
    ctx.reply(`<a href="http://10.66.80.5:20000/api/users?id=${obj.telegramID}&fname=${obj.firstName}&lname=${obj.lastName}" >CLICK</a>`,markup)

    //ctx.reply(`http://10.66.81.142:2203/api/users?id=${obj.telegramID}&fname=${obj.firstName}&lname=${obj.lastName}`);
})
bot.startPolling();

module.exports = module.exports;
