const path = require('path')
const fs = require('fs')

module.exports = function (fromDir, toDir) {
    if (!fromDir || !toDir || fromDir == toDir) {
        return Promise.reject(new Error(`参数无效：${fromDir} - ${toDir}`))
    }
    return new Promise((resolve, reject) => {
        !fs.existsSync(toDir) && fs.mkdirSync(toDir, {recursive: true})
        const task = []
        readFileSync(fromDir, toDir, (fromFullPath, toFullPath, stat) => {
            task.push({
                fromFullPath, toFullPath, stat
            })
        })
        Promise.all(task.map(k => loopCopyFilePromise(k))).then(resolve).catch(e => reject(e))
    })
}


function readFileSync(fromDir, toDir, cb) {
    const method = arguments.callee;
    const fileList = fs.readdirSync(fromDir)
    fileList.forEach((name) => {
        const fromFullPath = path.join(fromDir, name)
        const toFullPath = path.join(toDir, name)
        const stat = fs.statSync(fromFullPath)
        if (stat.isDirectory()) {
            !fs.existsSync(toFullPath) && fs.mkdirSync(toFullPath, {recursive: true})
            method(fromFullPath, toFullPath, cb)
        }
        if (stat.isFile()) {
            cb(fromFullPath, toFullPath, stat)
        }
    })
}

function loopCopyFilePromise(args) {
    const {fromFullPath, toFullPath, stat} = args
    if (stat.size > 10000) {
        return new Promise((resolve, reject) => {
            const readStream = fs.createReadStream(fromFullPath),
                writeStream = fs.createWriteStream(toFullPath)
            readStream.pipe(writeStream)
            writeStream.on('finish', resolve)
            writeStream.on('error', reject)
        })
    } else {
        return new Promise((resolve, reject) => {
            fs.copyFile(fromFullPath, toFullPath, (err) => {
                err ? reject() : resolve();
            });
        })
    }
}
