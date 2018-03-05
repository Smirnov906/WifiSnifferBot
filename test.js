const { spawn } = require('child_process');
const fs = require('fs');
const async = require('async')

function test() {
    let files = fs.readdirSync(__dirname + '/parsing_data');
    async.each(files, (file, next) => {
        //rm -rf out/out7.cap


    })
}
test();