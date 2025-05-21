import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 })
  }

  let body: { 
    audioUrl?: string;
    voiceId?: string;
  } = {}
  
  try {
    body = await req.json()
  } catch (_e) {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400 })
  }

  const { audioUrl, voiceId } = body
  
  if (!audioUrl && !voiceId) {
    return new Response(
      JSON.stringify({ error: 'Either audioUrl or voiceId is required' }), 
      { status: 400 }
    )
  }

  // If voiceId is provided, fetch the audio URL from the database
  let audioFileUrl = audioUrl
  if (voiceId) {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') as string
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    try {
      const { data, error } = await supabase
        .from('voice_overs')
        .select('audio_url, transcript')
        .eq('id', voiceId)
        .single()
        
      if (error || !data) {
        throw new Error('Voice not found')
      }
      
      audioFileUrl = data.audio_url
    } catch (error) {
      return new Response(
        JSON.stringify({ error: 'Failed to fetch voice data' }), 
        { status: 500 }
      )
    }
  }

  // In a real implementation, we would use a voice analysis API
  // For this demo, we'll simulate the analysis with random scores
  try {
    // Simulate analyzing the audio
    // For demo purposes, generate pseudo-random but consistent values based on the URL or ID
    const seed = voiceId || (audioFileUrl || '').substring(0, 10)
    const hash = Array.from(seed).reduce((acc, char) => acc + char.charCodeAt(0), 0)
    
    // Generate consistent values between 60-95
    const clarity = 60 + Math.floor((hash % 35))
    const emotion = 60 + Math.floor((hash * 2) % 35)
    const pace = 60 + Math.floor((hash * 3) % 35)
    const engagement = 60 + Math.floor((hash * 4) % 35)
    
    // Generate recommendations based on the scores
    const recommendations = []
    
    if (clarity < 75) {
      recommendations.push('Improve audio clarity by recording in a quieter environment.')
    }
    
    if (emotion < 75) {
      recommendations.push('Try to add more emotional variation for greater engagement.')
    }
    
    if (pace < 75) {
      recommendations.push('Consider adjusting your speaking pace for better comprehension.')
    }
    
    if (engagement < 75) {
      recommendations.push('Add more emphasis on key points to increase listener engagement.')
    }
    
    if (recommendations.length === 0) {
      recommendations.push('Excellent voice performance! Maintain consistent quality for future recordings.')
    }
    
    // Format the response
    const analysisResults = {
      clarity,
      emotion,
      pace,
      engagement,
      recommendations
    }
    
    return new Response(
      JSON.stringify(analysisResults), 
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error analyzing voice:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to analyze voice' }), 
      { status: 500 }
    )
  }
})