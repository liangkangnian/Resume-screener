export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: '只支持 POST 请求' });
  }

  try {
    const { resumeText, criteria, fileName } = req.body;

    const key = process.env.VECTORENGINE_API_KEY;
    const baseUrl = process.env.API_BASE_URL || 'https://api.openai.com';
    const model = process.env.API_MODEL || 'gpt-4o-mini';

    if (!key) {
      return res.status(500).json({ error: '服务端未配置 API Key，请联系管理员。' });
    }

    if (!resumeText || !criteria) {
      return res.status(400).json({ error: '缺少简历内容或筛选条件' });
    }

    const systemPrompt = `你是一位资深的人力资源专家和简历筛选助手。你的任务是根据老板提供的筛选条件，对候选人的简历进行专业评估。

请严格按照以下JSON格式返回评估结果（不要包含任何其他文本，只返回纯JSON）：
{
  "name": "候选人姓名（从简历中提取）",
  "score": 85,
  "recommendation": "推荐/待定/不推荐",
  "matchedCriteria": ["匹配的条件1", "匹配的条件2"],
  "missingCriteria": ["不满足的条件1"],
  "highlights": ["亮点1", "亮点2"],
  "concerns": ["疑虑1"],
  "summary": "一句话总结评价"
}

评分标准：
- 90-100分：完全匹配所有核心条件，强烈推荐 → "推荐"
- 70-89分：满足大部分条件，值得考虑 → "推荐" 或 "待定"
- 50-69分：部分匹配，有明显缺口 → "待定"
- 50分以下：不符合核心要求 → "不推荐"`;

    const userPrompt = `## 筛选条件
${criteria}

## 简历文件名
${fileName || '未知'}

## 简历内容
${resumeText}

请按照要求的JSON格式进行评估。`;

    const response = await fetch(`${baseUrl}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.3,
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      const errMsg = errData?.error?.message || `OpenAI API 错误: ${response.status}`;
      return res.status(response.status).json({ error: errMsg });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';

    let result;
    try {
      const cleaned = content.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
      result = JSON.parse(cleaned);
    } catch {
      result = {
        name: '解析失败',
        score: 0,
        recommendation: '待定',
        matchedCriteria: [],
        missingCriteria: [],
        highlights: [],
        concerns: ['AI返回内容解析失败，请重试'],
        summary: content.substring(0, 200),
      };
    }

    return res.status(200).json({ success: true, result, fileName });
  } catch (error) {
    console.error('Screen API error:', error);
    return res.status(500).json({ error: `服务器内部错误: ${error.message}` });
  }
}
