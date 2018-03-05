var mongoose = require('mongoose');

var unknownScheme = mongoose.Schema({
    macAddress: {
        type: String,
        unique: true
    },
    date: {
        type: String
    }
},
{
    versionKey:false
},
{
    versionKey:false
})


module.exports = mongoose.model('Unknown',unknownScheme);