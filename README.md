# 小高导航 · Aoian Nav

个人门户 / 书签导航页的现代化重构版本。原页面 https://www.aoian.cn/ 基于 jQuery + 旧模板,这里用纯静态前端重写,零依赖、可直接托管。

## 预览

本地预览:

```bash
python3 -m http.server 8765
# 访问 http://localhost:8765/
```

或任意静态服务器(Nginx / Vercel / Netlify / GitHub Pages 均可)。

## 功能

- 玻璃拟态布局 + 渐变 Hero 标题
- Canvas 交互式星空背景(鼠标排斥、闪烁、离屏暂停)
- 实时时钟 + 建站天数统计
- 每日诗词(jinrishici API)
- 暗色 / 亮色主题切换(支持跟随系统,记忆到 localStorage)
- 实时卡片搜索过滤(支持中文 / 英文 / 按 `/` 聚焦,`Esc` 清空)
- 卡片鼠标高光跟随 + 入场动画
- 完全响应式:桌面 / 平板 / 移动端适配
- 无第三方追踪脚本

## 项目结构

```
aoian-nav/
├── index.html        页面结构
├── css/style.css     主题样式 (CSS Variables 驱动)
├── js/script.js      交互逻辑 (Canvas / 时钟 / 搜索 / 主题)
└── assets/           (预留) 图片资源目录
```

## 自定义

- **主题色**: 修改 `css/style.css` 顶部的 `--accent` / `--accent-2`
- **新增卡片**: 在 `index.html` 的 `<div class="grid">` 中按现有结构追加 `.card`
- **站点数据集中管理**: 后续可把卡片数据抽到 `data/sites.json` 并由 `js/script.js` 渲染

## 部署

推送到任意静态托管平台即可,无需构建步骤。

## License

MIT