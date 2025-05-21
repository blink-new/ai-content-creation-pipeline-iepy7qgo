import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 })
  }

  let body: { 
    name?: string;
    sampleText?: string;
    settings?: {
      pitch?: number;
      speed?: number;
      clarity?: number;
      emotion?: number;
    };
    avatarId?: string;
    userId?: string;
  } = {}
  
  try {
    body = await req.json()
  } catch (_e) {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400 })
  }

  const { name, sampleText, settings, avatarId, userId } = body
  
  if (!name || !sampleText) {
    return new Response(
      JSON.stringify({ error: 'Voice name and sample text are required' }), 
      { status: 400 }
    )
  }

  // In a real implementation, we would use a text-to-speech API like ElevenLabs, Azure, or Amazon Polly
  // For this demo, we'll simulate the voice creation with a delay and return mock data
  
  try {
    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') as string
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Calculate duration based on text length
    const duration = Math.max(3, Math.round(sampleText.length / 20))
    
    // For now, we'll use a sample audio URL
    // In production, this would be a URL to the generated audio file
    const audioUrl = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'
    
    // Insert the voice into the database
    const { data, error } = await supabase
      .from('voice_overs')
      .insert({
        name,
        avatar_id: avatarId,
        audio_url: audioUrl,
        transcript: sampleText,
        duration: duration,
        user_id: userId,
        voice_settings: settings || {}
      })
      .select()
      .single()
      
    if (error) {
      console.error('Database error:', error)
      throw new Error('Failed to store voice data')
    }
    
    // Format the response
    const voiceData = {
      id: data.id,
      name: data.name,
      avatarId: data.avatar_id,
      audioUrl: data.audio_url,
      transcript: data.transcript,
      duration: data.duration,
      createdAt: data.created_at,
      settings: data.voice_settings
    }
    
    return new Response(
      JSON.stringify(voiceData), 
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error generating voice:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to generate voice' }), 
      { status: 500 }
    )
  }
})