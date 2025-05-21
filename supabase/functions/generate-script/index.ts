import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 })
  }

  let body: { prompt?: string; length?: string } = {}
  try {
    body = await req.json()
  } catch (_e) {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400 })
  }

  const prompt = body.prompt?.trim()
  const length = body.length || 'medium'
  if (!prompt) {
    return new Response(JSON.stringify({ error: 'Prompt is required' }), { status: 400 })
  }

  // Map length to max_tokens
  const maxTokens = length === 'short' ? 300 : length === 'long' ? 1200 : 600

  // Get OpenAI API key from env
  const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')
  if (!OPENAI_API_KEY) {
    return new Response(JSON.stringify({ error: 'OpenAI API key not set' }), { status: 500 })
  }

  // Compose the system prompt
  const systemPrompt =
    'You are a helpful assistant that writes engaging, clear, and concise training video scripts. The script should be suitable for AI avatar video generation.'

  // Call OpenAI API
  try {
    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4.1-nano',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt },
        ],
        max_tokens: maxTokens,
        temperature: 0.7,
      }),
    })
    const data = await openaiRes.json()
    if (!openaiRes.ok) {
      return new Response(JSON.stringify({ error: data.error?.message || 'OpenAI error' }), { status: 500 })
    }
    const script = data.choices?.[0]?.message?.content?.trim() || ''
    return new Response(JSON.stringify({ script }), { status: 200 })
  } catch (_e) {
    return new Response(JSON.stringify({ error: 'Failed to contact OpenAI' }), { status: 500 })
  }
})
