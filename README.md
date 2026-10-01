# Akinator 猜谜（单页应用）

离线运行、零依赖的 Akinator 式猜谜游戏。

## 运行

直接用浏览器打开 `index.html`，或：

    python3 -m http.server 8080
    # 打开 http://localhost:8080

## 测试

    npm test

## 玩法

心里想一个角色 → 回答一系列问题 → 让 Akinator 猜。猜不中时可以教它这个新角色，
新角色保存在浏览器 localStorage，下次可被猜中。

## 结构

- `js/data/characters.js` 属性表与角色库
- `js/engine.js` 纯函数推理引擎
- `js/storage.js` 本地持久化
- `js/app.js` 状态机与界面
