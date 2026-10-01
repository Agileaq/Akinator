# Akinator 猜谜（单页应用）

离线运行、零依赖的 Akinator 式猜谜游戏。

## 运行

双击 `index.html` 即可（浏览器直接以 `file://` 打开，无需服务器）。

`index.html` 加载的是经典脚本 `js/bundle.js`——因为 ES Module 的 `import` 在 `file://`
下会被 CORS 拦截，所以打包成单文件。也可选择用服务器运行：

    python3 -m http.server 8080
    # 打开 http://localhost:8080

## 测试

    npm test

修改 `js/data/characters.js`、`js/engine.js`、`js/storage.js`、`js/app.js` 任一源文件后，
重新生成浏览器用的 bundle：

    node tools/build.mjs

（`npm test` 中有一项会校验 `js/bundle.js` 与源文件一致，忘了重新生成会测试失败。）

## 玩法

心里想一个角色 → 回答一系列问题 → 让 Akinator 猜。猜不中时可以教它这个新角色，
新角色保存在浏览器 localStorage，下次可被猜中。

## 结构

- `js/data/characters.js` 属性表与角色库（ES Module 源文件）
- `js/engine.js` 纯函数推理引擎（ES Module 源文件，可单测）
- `js/storage.js` 本地持久化（ES Module 源文件）
- `js/app.js` 状态机与界面（ES Module 源文件）
- `js/bundle.js` 由上面四个源文件生成的经典脚本，供 `index.html` 在 `file://` 下加载
- `tools/build.mjs` 零依赖打包脚本
