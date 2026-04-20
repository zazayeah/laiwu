# 系统 Git 使用说明

当前仓库只纳入系统相关内容，主要包括：

- `laiwu/`
- `laiwu_vue版/`
- `laiwu_algo_python/`
- `laiwu_backend_java/`
- `laiwu_联调说明.md`
- `技术路线.md`
- `scripts/`

## 首次绑定远端

```bash
./scripts/git_set_remote.sh <远端仓库地址>
```

例如：

```bash
./scripts/git_set_remote.sh git@github.com:your-name/laiwu-heavy-truck.git
```

脚本会：

1. 绑定或更新 `origin`
2. 切换主分支为 `main`
3. 首次推送到远端

## 后续更新

```bash
./scripts/git_update.sh "你的提交说明"
```

例如：

```bash
./scripts/git_update.sh "feat: 更新用户画像与辅助决策页面"
```

脚本会：

1. 自动暂存系统相关目录
2. 创建本地提交
3. 如果已经配置 `origin`，自动推送当前分支

## 查看当前状态

```bash
git status
git log --oneline -5
```
