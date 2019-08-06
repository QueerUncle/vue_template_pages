#### Utils
>`
utils--->views：存放项目打包时所展现的静态ui页面（不可以改名字）
`

>`
utils--->AllPages.json：点击保存配置所生成的文件，
该文件记录项目中所有页面的打包信息。
下一次再运行打包程序时，所以这个文件存在，优先读取
改文件内的配置。
`

>`
utils--->app-linux：linux系统中项目打包程序
`

>`
utils---app-macos>：苹果电脑中项目打包程序
`

>`
utils---app-win.exe>：windows系统中项目打包程序
`

>`
utils---Page.json>：点击打包按钮时生成的文件，
该文件本次打包的页面信息。
`

>`
utils---utils.js>：运行vue.config.js时，获取多页信息的js,
其中：
getPages()方法是不带ui的获取多页对象的函数。该方法依赖威哥单页中的conf.json文件。
getPagesByGUI()方法是带ui的获取多页对象的函数。
`

