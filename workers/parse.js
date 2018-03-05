const { spawn } = require('child_process');
const path = require('path');

let pending = false;
let filePath = path.join(__dirname,'parsingFunctions.js')
//console.log(filePath);

function Parsing () {
    if(!pending) {
        pending = true;
        let nodeParse = spawn('node',[filePath]);
        nodeParse.on('error',(err) => {
            console.log(err);
            console.log('child error')
            pending = false;
        });
        nodeParse.on('close',(data) => {
            console.log(data);
            console.log('child close')
            pending = false;
        });
    }
}   

// setInterval(() => {
//     Parsing();
// },1000)