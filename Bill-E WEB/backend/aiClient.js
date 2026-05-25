const AI_API_KEY = process.env.AI_API_KEY || process.env.OPENAI_API_KEY || '';
const AI_MODEL = process.env.AI_MODEL || 'gpt-4o-mini';
const OPENAI_BASE_URL = process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1';

function isAiConfigured() {
  return Boolean(AI_API_KEY);
}

async function createChatCompletion(messages, options = {}) {
  if (!isAiConfigured()) {
    throw new Error('AI provider not configured');
  }

  const response = await fetch(`${OPENAI_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${AI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: options.model || AI_MODEL,
      messages,
      temperature: options.temperature ?? 0.2,
      response_format: options.json ? { type: 'json_object' } : undefined,
    }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error?.message || `AI request failed with status ${response.status}`);
  }

  return data.choices?.[0]?.message?.content || '';
}

module.exports = { createChatCompletion, isAiConfigured };
