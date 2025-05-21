import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

serve(async (req) => {
  // Accept both POST and GET methods
  if (req.method !== 'POST' && req.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 })
  }

  let userId;
  
  if (req.method === 'GET') {
    const url = new URL(req.url);
    userId = url.searchParams.get('userId');
  } else {
    // POST request
    try {
      const body = await req.json();
      userId = body.userId;
    } catch (e) {
      return new Response(
        JSON.stringify({ error: 'Invalid JSON' }), 
        { status: 400 }
      );
    }
  }
  
  if (!userId) {
    return new Response(
      JSON.stringify({ error: 'User ID is required' }), 
      { status: 400 }
    )
  }

  try {
    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') as string
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    // Get voice overs for the user and join with avatars
    const { data: voiceOvers, error } = await supabase
      .from('voice_overs')
      .select(`
        id,
        name,
        audio_url,
        transcript,
        duration,
        voice_settings,
        created_at,
        avatar_id,
        avatars(
          id,
          name,
          gender,
          appearance,
          image_url
        )
      `)
      .eq('user_id', userId)
    
    if (error) {
      throw new Error('Failed to fetch voice overs')
    }
    
    // If there are no voice overs yet, return an empty array
    if (voiceOvers.length === 0) {
      return new Response(
        JSON.stringify([]), 
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    }
    
    // Format the response
    const formattedVoiceOvers = voiceOvers.map(vo => ({
      id: vo.id,
      name: vo.name,
      avatarId: vo.avatar_id,
      audioUrl: vo.audio_url,
      transcript: vo.transcript,
      duration: vo.duration,
      createdAt: vo.created_at,
      settings: vo.voice_settings || {},
      avatar: vo.avatars ? {
        id: vo.avatars.id,
        name: vo.avatars.name,
        gender: vo.avatars.gender,
        appearance: vo.avatars.appearance,
        imageUrl: vo.avatars.image_url
      } : null
    }))
    
    return new Response(
      JSON.stringify(formattedVoiceOvers), 
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error fetching voice overs:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to fetch voice overs' }), 
      { status: 500 }
    )
  }
})