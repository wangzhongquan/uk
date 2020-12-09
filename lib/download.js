const downloadGitRepo = require('download-git-repo') // https://www.npmjs.com/package/download-git-repo
const ora = require('ora')
const path = require('path')

const TEMP_FOLDER = '.temp';

module.exports = function (target, gitRepo) {
    target = path.join(TEMP_FOLDER, target || '');
    return new Promise((resolve, reject) => {
        const url = `direct:${gitRepo}`
        const spinner = ora(`远程仓库不能为私有，否则会挂起,正在下载项目:${gitRepo}`)
        spinner.start()
        downloadGitRepo(url, target, {clone: true}, (err) => {
            if (err) {
                spinner.fail()
                reject(err)
            } else {
                spinner.succeed()
                resolve({
                    downloadTemp: TEMP_FOLDER,
                    target
                })
            }
        })
    })
}
