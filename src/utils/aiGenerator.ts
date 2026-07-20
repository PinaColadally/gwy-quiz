/**
 * AI 题目生成器
 * 使用 DeepSeek API 基于最新时事生成新题
 */

interface GeneratedQuestion {
  type: 'single' | 'multi' | 'judge';
  category: string;
  subCategory: string;
  difficulty: 1 | 2 | 3;
  question: string;
  options: string[];
  answer: number[];
  explanation: string;
  source: string;
  tags: string[];
}

const SYSTEM_PROMPT = `你是一名公务员考试行测常识判断命题专家。请严格遵循以下要求出题：

1. 题目风格必须与国考省考真题完全一致，考察知识性记忆和理解
2. 选项通常为4个，单选题1个正确，多选题2-4个正确
3. 解析要详细、准确，说明为什么选这个答案
4. 来源标注必须真实可查（如"2026年政府工作报告""二十届四中全会公报""2026年新年贺词"等）
5. 难度分级：1=简单（基础知识点）、2=中等（需要一定理解）、3=困难（易混淆或细节）

请以JSON格式输出，格式：
{
  "questions": [
    {
      "type": "single",
      "category": "政治理论",
      "subCategory": "习近平新时代中国特色社会主义思想",
      "difficulty": 2,
      "question": "题干内容",
      "options": ["A选项","B选项","C选项","D选项"],
      "answer": [0],
      "explanation": "详细解析",
      "source": "来源",
      "tags": ["标签1","标签2"]
    }
  ]
}`;

export async function generateAIQuestions(
  apiKey: string,
  baseUrl: string,
  model: string,
  topic: string,
  count: number = 5
): Promise<GeneratedQuestion[]> {
  if (!apiKey) {
    throw new Error('请先在设置中配置API Key');
  }

  const prompt = `请基于以下主题，生成${count}道公务员考试常识判断题：

主题：${topic}

出题要求：
1. 必须基于最新时事和权威信息（2025-2026年）
2. 符合国考省考常识判断的命题风格
3. 涵盖单选、判断题型
4. 每个题目都要有真实可查的来源出处

请严格按照JSON格式输出。`;

  try {
    const response = await fetch(`${baseUrl}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 4096,
      }),
    });

    if (!response.ok) {
      throw new Error(`API请求失败: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';

    // 尝试从返回中提取JSON
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('AI返回格式异常，无法解析题目');
    }

    const parsed = JSON.parse(jsonMatch[0]);
    return parsed.questions || [];
  } catch (err) {
    const msg = err instanceof Error ? err.message : '未知错误';
    throw new Error(`AI出题失败: ${msg}`);
  }
}

/**
 * 生成 AI 出题的主题建议（基于当前月份）
 */
export function getSuggestedTopics(): { label: string; desc: string }[] {
  const year = new Date().getFullYear();
  const month = new Date().getMonth() + 1;

  // 根据月份推荐不同的时事主题
  const seasonalTopics: Record<number, { label: string; desc: string }[]> = {
    1: [
      { label: '新年贺词', desc: `${year}年新年贺词核心要点` },
      { label: '全国两会前瞻', desc: `${year}年全国两会主要议题` },
    ],
    3: [
      { label: '政府工作报告', desc: `${year}年政府工作报告主要内容` },
      { label: '两会精神', desc: `${year}年全国两会精神要点` },
    ],
    7: [
      { label: '年中经济形势', desc: `${year}年上半年经济形势与政策` },
      { label: '建党相关', desc: '党的历史与党的建设新要求' },
    ],
    10: [
      { label: '国庆相关', desc: '国庆讲话与成就回顾' },
      { label: '全会精神', desc: '最新中央全会精神' },
    ],
    12: [
      { label: '中央经济工作会议', desc: `${year}年中央经济工作会议精神` },
      { label: '年度总结', desc: `${year}年重大成就回顾` },
    ],
  };

  // 选择当月话题，如果没有则给通用话题
  const topics = seasonalTopics[month] || [
    { label: '最新时事', desc: `${year}年国内外重大时事` },
    { label: '政策新规', desc: `${year}年新出台的重要政策法规` },
  ];

  return topics;
}
