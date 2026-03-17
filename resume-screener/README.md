# AI 简历筛选助手 📋

基于 OpenAI GPT 的智能简历批量筛选工具。上传 PDF 简历，设置筛选条件，AI 自动逐份分析、打分、给出推荐。

## 功能特点

- 📤 批量上传 PDF 简历（拖拽或点击）
- 🎯 自定义筛选条件（硬性要求 + 加分项）
- 🤖 AI 逐份分析，自动提取姓名、打分、给出建议
- 📊 结果按分数排序，一眼看出谁值得面试
- 💾 导出 CSV 汇总表

## 部署到 Vercel

### 方法一：通过 GitHub 部署（推荐）

1. 在 GitHub 创建新仓库，如 `resume-screener`
2. 把项目所有文件推送到仓库
3. 打开 [vercel.com](https://vercel.com)，导入该仓库
4. 在 Vercel 项目设置中添加环境变量：
   - `OPENAI_API_KEY` = 你的 OpenAI API Key
5. 点击 Deploy，完成！

### 方法二：通过 Vercel CLI 部署

```bash
npm i -g vercel
cd resume-screener
vercel
```

部署时设置环境变量 `OPENAI_API_KEY`。

## 使用方式

1. 打开网站
2. 输入 OpenAI API Key（如果没有设置环境变量）
3. 选择模型（gpt-4o-mini 速度快、gpt-4o 更精准）
4. 编写筛选条件
5. 上传 PDF 简历
6. 点击"开始 AI 筛选"
7. 查看结果，导出 CSV

## 项目结构

```
resume-screener/
├── public/
│   └── index.html      # 前端页面
├── api/
│   └── screen.js       # Vercel Serverless Function (调用 OpenAI)
├── package.json
├── vercel.json          # Vercel 部署配置
└── README.md
```

## 注意事项

- PDF 文本提取在浏览器端完成（使用 pdf.js），扫描件/图片型 PDF 可能无法识别
- API Key 可以在页面输入（方便测试）或通过 Vercel 环境变量设置（更安全）
- 每份简历会消耗一次 API 调用，建议用 gpt-4o-mini 控制成本
