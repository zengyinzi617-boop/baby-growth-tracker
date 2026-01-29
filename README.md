# Baby Growth Tracker

一个简单美丽的宝宝成长记录网站，支持时间线视图、图片/视频上传、相册分类、评论点赞等功能。

## 功能特性

- 📅 **时间线视图** - 按时间展示宝宝成长记录，自动计算宝宝年龄
- 🖼️ **媒体上传** - 支持图片和视频上传，最多9个文件
- 📁 **相册分类** - 创建相册整理照片
- 💬 **评论点赞** - 家人可以评论和点赞
- 🔒 **访问密码** - 保护隐私，只有知道密码的人才能访问
- 🎂 **里程碑标记** - 标记重要的成长时刻

## 快速开始

### 1. 注册账号

- [Supabase](https://supabase.com) - 免费数据库和存储
- [Vercel](https://vercel.com) - 免费网站托管

### 2. 设置 Supabase

1. 登录 Supabase，进入 [SQL Editor](https://supabase.com/dashboard/sql)
2. 复制 `supabase-setup.sql` 文件内容并执行
3. 进入 [Storage](https://supabase.com/dashboard/storage) 创建两个存储桶：
   - `photos` - 公开，图片类型
   - `videos` - 公开，视频类型

4. 获取配置信息：
   - Project URL: Settings → API → Project URL
   - anon public key: Settings → API → anon public key
   - service_role key: Settings → API → service_role key（仅服务器使用）

### 3. 设置 Vercel

1. Fork 这个仓库到你的 GitHub
2. 登录 [Vercel](https://vercel.com)，导入你的仓库
3. 在 Environment Variables 中添加：
   ```
   NEXT_PUBLIC_SUPABASE_URL=你的Supabase URL
   NEXT_PUBLIC_SUPABASE_ANON_KEY=你的anon key
   SUPABASE_SERVICE_ROLE_KEY=你的service_role key
   NEXT_PUBLIC_SITE_PASSWORD=你的访问密码
   ```
4. Deploy！

### 4. 本地开发

```bash
cd baby-growth-tracker
npm install
cp .env.local.example .env.local
# 编辑 .env.local 填入配置
npm run dev
```

## 使用说明

1. 打开网站，输入密码进入
2. 在「添加记录」页面创建新的成长记录
3. 在「时间线」查看所有记录，按分类筛选
4. 在「相册」创建相册整理照片

## 技术栈

- **Next.js 15** - React 框架
- **Tailwind CSS** - 样式
- **Supabase** - 数据库和文件存储
- **date-fns** - 日期处理

## 许可证

MIT
