var mongoose = require('mongoose');

var userScheme = mongoose.Schema({
    name: String,
    telegramID: String,
    macAddress: {
        type: String,
        unique: true
    },
    messageSent: {
        type: Boolean,
        default: false
    },
    status: {
        date: {
            type: String,
        },
        lastContact: {
            type: String,
        },
        timeFirstSeen: {
            type: String,
        },
        onWork: {
            type: Boolean,
            default: false
        },
        leftTime: {
            type: String
        }
    },
    history: []
},
{
    versionKey:false
})


module.exports = mongoose.model('User',userScheme);