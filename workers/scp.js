const { spawn } = require('child_process');
const path = require('path');
const async = require('async');
let parsing_data = path.join(__dirname, '/parsing_data/');
let pending = false;
let fs = require('fs');
let scp_param = 'root@10.66.81.2:/tmp/out/out*';
//let scp_param = 'maxim@192.168.1.7:out/out/*';

let ssh_param = 'root@10.66.81.2'
//let ssh_param = 'maxim@192.168.1.7'
let { newParsing } = require('./newParsing');
const moment = require('moment')
let currentDay = moment().format('DD.MM.YYYY')
let num = 1;
// console.log(parsing_data);
// console.log(num);

function SCP() {
    if (!pending) {
        const start = new Date();
        let dir = __dirname + '/../archive/' + currentDay
        dir = path.normalize(dir);
        //console.log(dir);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }
        pending = true;
        let node_scp = spawn('scp', ['-r', scp_param, parsing_data])

        node_scp.stdout.on('end', (data) => {
            console.log("copied");
            let files = fs.readdirSync(parsing_data)
            async.eachSeries(files, (file, next) => {
                let filename = path.join(__dirname, '/parsing_data/' + file);
                newParsing(filename, next);
            }, () => {
                console.log('finish');
                let dir = __dirname + '/../archive/' + currentDay + '/' + num;
                dir = path.normalize(dir);
                if (!fs.existsSync(dir)) {
                    fs.mkdirSync(dir);
                    let files = fs.readdirSync(parsing_data)
                    console.log(files.length);
                    async.each(files, (file, callback) => {
                        let name = path.join(__dirname, '/parsing_data/' + file);
                        fs.renameSync(name, dir + '/' + file);
                        let test_spawn = spawn('ssh', [ssh_param, 'rm', '-rf', '/tmp/out/' + file]);
                        test_spawn.stderr.on('data', (data) => {
                            //console.log(data.toString());
                        });
                        test_spawn.stdout.on('end', (data) => {
                            console.log('removed');
                            callback();                            
                        })
                    }, () => {
                        num++;
                        pending = false;
                        console.log('Time: %sms', new Date - start)
                    })
                }
            })
        });
        node_scp.on('close', (code) => {
            if (code !== 0) {
                console.log('Failed: ' + code);
                pending = false;
            }
        });
    }
}
setInterval(() => {
    SCP();
}, 1000)