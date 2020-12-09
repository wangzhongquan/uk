
## 拉取代码工具(脚手架)

使用commander工具制作简易拉取代码工具

1 本地使用，clone项目到本地，
使用方式:   node ./bin/uk 目录 远程地址
例如将 https://github.com/wangzhongquan/uk.git  拉到到当前目录myapp中
```
node  ./bin/uk  myapp  https://github.com/wangzhongquan/uk.git
```
2 作为npm包使用，先下载包，再使用

将工具代码发布到私有npm库再从私有库下载包为例

切换到私有库
```
nrm use <私有npm库地址>
```
发布到私有库
```
npm publish
```
找个空白目录或者新建目录，拉取uk包
```
npm i uk
```
使用uk工具拉取代码，命令格式： uk 目录 远程地址，如

```
npx uk myapp  https://github.com/wangzhongquan/uk.git
```
