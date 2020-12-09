#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const chalk = require('chalk') // nodejs 终端打印信息
const program = require('commander') // 命令行处理工具
const logSymbols = require('log-symbols') // 在终端上显示 × 和 √

const ora = require('ora') // 用于命令行上的加载效果

const download = require('../lib/download')
const filecopy = require('../lib/filecopy')

program.usage('<project-name> <git-remote-address>').parse(process.argv) // 解析

let projectName = program.args[0] // 获取项目名称
let gitRepo = program.args[1] || 'https://github.com/wangzhongquan/site.git'


if (!projectName) {
    program.help()
    return
}

const inquirer = require('inquirer') // https://www.npmjs.com/package/inquirer

const glob = require('glob') // 读取文件/目录
const list = glob.sync('*') // 遍历当前目录

// const allFile = glob.sync('**') // 遍历当前目录下所有目录

let next = undefined

if (list.length) {
    const spinner = ora('检查项目是否存在...')
    spinner.start()
    if (list.filter(name => {
        const fileName = path.resolve(process.cwd(), path.join('.', name))
        const isDir = fs.statSync(fileName).isDirectory()
        return name.indexOf(projectName) !== -1 && isDir
    }).length !== 0) {
        return spinner.fail(`项目${projectName}已经存在`)
    }
    spinner.succeed()
    next = Promise.resolve(projectName)
} else {
    next = Promise.resolve(projectName)
}

next && task()

function task() {
    next.then(projectRoot => {
        if (projectRoot !== '.') {
            fs.mkdirSync(projectRoot)
        }
        return download(projectRoot, gitRepo).then(target => { // 下载项目模板
            return {
                name: projectRoot,
                root: projectRoot,
                downloadTemp: target.downloadTemp
            }
        })
    }).then(context => { // 交互问答，配置项目信息
        return inquirer.prompt([{
            name: 'projectName',
            message: '项目名称',
            default: context.name
        }, {
            name: 'projectVersion',
            message: '项目版本号',
            default: '1.0.0'
        }]).then(answers => {
            return {
                ...context,
                metadata: {
                    ...answers
                }
            }
        })
    }).then(context => {
        return filecopy(context.downloadTemp, '.').then(() => {
            const rm = require('rimraf').sync
            rm(context.downloadTemp)
        })
    }).then(() => {
        console.log(logSymbols.success, chalk.green('项目拉取完成。'))
    }).catch(err => {
        console.error(logSymbols.error, chalk.red(`构建失败：${err.message}`))
    })
}
