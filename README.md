# Stuff Happens – Single‑Player Web Game (Skeleton)

> **Deadline**: 19 Jun 2025 – This repo gives you a ready‑to‑run baseline so you can focus on game logic & styling.

## Monorepo layout

```
stuff-happens/
├── README.md                     # 项目说明文档
├── .gitignore                   # Git忽略文件
│
├── server/                      # Node.js 后端 (Node 22 + Express + SQLite)
│   ├── package.json            # 后端依赖配置
│   ├── package-lock.json       # 后端依赖锁定
│   ├── index.mjs               # 服务器入口文件
│   │
│   ├── db/                     # 数据库相关
│   │   ├── init.js            # 数据库初始化
│   │   ├── seed_cards.sql     # 卡片数据
│   │   └── stuff.db           # SQLite数据库文件（运行时生成）
│   │
│   ├── routes/                 # API路由
│   │   ├── auth.js            # 认证相关路由
│   │   ├── games.js           # 游戏相关路由
│   │   └── index.js           # 路由总入口
│   │
│   │
│   └── auth/                  
│       ├── passport.js       
│       
│
└── client/                     # React 前端 (React 18 + Vite)
    ├── package.json           # 前端依赖配置
    ├── package-lock.json      # 前端依赖锁定
    ├── vite.config.js         # Vite配置
    ├── index.html             # HTML入口
    │
    │
    ├── src/                   # 源代码
    │   ├── main.jsx          # React入口文件
    │   ├── App.jsx           # 主应用组件
    │   ├── index.css         # 全局样式
    │   │
    │   ├── components/        # 可复用组件
    │   │   ├── GameBoard.jsx # 游戏棋盘
    │   │   ├── GameBoard.css
    │   │   ├── TimerBar.jsx  # 计时器
    │   │   ├── TimerBar.css
    │   │
    │   ├── pages/            # 页面组件
    │   │   ├── Login.jsx     # 登录页
    │   │   ├── Login.css
    │   │   ├── Play.jsx      # 游戏页
    │   │   ├── Play.css
    │   │   ├── Profile.jsx   # 个人资料
    │   │   ├── Profile.css
    │   │   ├── DemoPage.jsx  # 演示页
    │   │   ├── DemoPage.css
    │   │   ├── GameRules.jsx # 规则页
    │   │   └── GameRules.css
    │   │
    │   ├── context/          # React Context
    │   │   └── AuthContext.jsx # 认证上下文
    │   ├── assets/          
    │   │   └── images 
    │   
    
```

### Quick start

```bash
# 1. start API
cd server
npm i
npm run dev        # http://localhost:4000

# 2. start front‑end
cd ../client
npm i
npm run dev        # http://localhost:5173
```

The first backend run seeds one demo user (`demo/demo`) and 50 placeholder cards.

## Next TODOs

- Implement `/games/:id/guess` logic & victory conditions.
- Build `<GameBoard />`, `<HiddenCard />` and timer bar.
- Style with Tailwind or your favourite CSS framework.
- Replace picsum images with real “Stuff Happens” card art.
