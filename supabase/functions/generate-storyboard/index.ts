import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

interface StoryboardFrame {
  imageUrl: string;
  description: string;
  duration: number;
}

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 })
  }

  let body: { script?: string } = {}
  try {
    body = await req.json()
  } catch (_e) {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400 })
  }

  const script = body.script?.trim()
  if (!script) {
    return new Response(JSON.stringify({ error: 'Script is required' }), { status: 400 })
  }

  // Get API keys from env
  const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')
  if (!OPENAI_API_KEY) {
    return new Response(JSON.stringify({ error: 'OpenAI API key not set' }), { status: 500 })
  }

  try {
    // Split the script into scenes
    const scenes = script.split('\n\n').filter(s => s.trim() !== '');
    if (scenes.length === 0) {
      return new Response(JSON.stringify({ 
        frames: [] 
      }), { status: 200 })
    }

    // Generate descriptions for each scene using OpenAI
    const framesPromises = scenes.map(async (scene, index) => {
      // Generate a description and image prompt for the scene
      const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4.1-nano',
          messages: [
            { 
              role: 'system', 
              content: 'You create concise descriptions for video scenes and generate image prompts based on script segments. Respond in JSON format with "description" and "imagePrompt" keys.' 
            },
            { 
              role: 'user', 
              content: `Create a short description and detailed image prompt for this script segment: "${scene}". The description should be concise (under 100 characters), and the image prompt should be detailed enough to generate a compelling visual.` 
            },
          ],
          response_format: { type: "json_object" },
          max_tokens: 300,
          temperature: 0.7,
        }),
      })
      
      if (!openaiRes.ok) {
        const errorData = await openaiRes.json();
        console.error('OpenAI API error:', errorData);
        throw new Error(errorData.error?.message || 'Failed to generate scene description');
      }
      
      const data = await openaiRes.json();
      const result = JSON.parse(data.choices[0].message.content);
      
      // For simplicity in this demo, we'll use a placeholder image service
      // In production, you would use DALL-E or similar to generate images
      const imageUrl = `https://picsum.photos/seed/${encodeURIComponent(scene.substring(0,10))}${index}/1280/720`;
      
      return {
        imageUrl,
        description: result.description,
        duration: Math.max(5, Math.round(scene.length / 15)) // Estimate duration based on text length
      };
    });

    // Wait for all frame generations to complete
    const frames = await Promise.all(framesPromises);
    
    return new Response(JSON.stringify({ frames }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error generating storyboard:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to generate storyboard frames' 
    }), { status: 500 });
  }
})