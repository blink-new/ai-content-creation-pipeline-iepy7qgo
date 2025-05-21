import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

serve(async (req) => {
  if (req.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 })
  }

  try {
    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') as string
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    // Check if avatars table exists and has data
    const { data: avatars, error } = await supabase
      .from('avatars')
      .select('*')
    
    if (error) {
      throw new Error('Failed to fetch avatars')
    }
    
    // If there are no avatars yet, seed the table with default avatars
    if (avatars.length === 0) {
      const defaultAvatars = [
        {
          name: 'Alex Johnson',
          gender: 'male',
          appearance: 'Professional, business casual, 30s',
          image_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=987&auto=format&fit=crop'
        },
        {
          name: 'Maya Rodriguez',
          gender: 'female',
          appearance: 'Corporate, business formal, 40s',
          image_url: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=987&auto=format&fit=crop'
        },
        {
          name: 'Taylor Kim',
          gender: 'neutral',
          appearance: 'Casual tech, startup style, 20s',
          image_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=1061&auto=format&fit=crop'
        },
        {
          name: 'James Wilson',
          gender: 'male',
          appearance: 'Construction worker, safety gear, 30s',
          image_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=987&auto=format&fit=crop'
        }
      ]
      
      const { data: insertedAvatars, error: insertError } = await supabase
        .from('avatars')
        .insert(defaultAvatars)
        .select()
      
      if (insertError) {
        throw new Error('Failed to seed avatars table')
      }
      
      // Return the newly inserted avatars
      return new Response(
        JSON.stringify(insertedAvatars.map(avatar => ({
          id: avatar.id,
          name: avatar.name,
          gender: avatar.gender,
          appearance: avatar.appearance,
          imageUrl: avatar.image_url
        }))), 
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    }
    
    // Return existing avatars
    return new Response(
      JSON.stringify(avatars.map(avatar => ({
        id: avatar.id,
        name: avatar.name,
        gender: avatar.gender,
        appearance: avatar.appearance,
        imageUrl: avatar.image_url
      }))), 
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error fetching avatars:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to fetch avatars' }), 
      { status: 500 }
    )
  }
})