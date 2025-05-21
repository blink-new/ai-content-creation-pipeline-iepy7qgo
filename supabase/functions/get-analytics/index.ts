import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

serve(async (req) => {
  let userId: string | null = null;

  if (req.method === 'GET') {
    const url = new URL(req.url);
    userId = url.searchParams.get('userId');
  } else if (req.method === 'POST') {
    try {
      const body = await req.json();
      userId = body.userId;
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400 });
    }
  } else {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  if (!userId) {
    return new Response(JSON.stringify({ error: 'User ID is required' }), { status: 400 });
  }

  try {
    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') as string;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get all projects for the user
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('id, title, status, created_at')
      .eq('user_id', userId);

    if (projectsError) {
      throw new Error('Failed to fetch projects');
    }

    // In a real implementation, we would calculate these metrics from actual usage data
    // For this demo, we'll generate plausible metrics based on the projects
    const totalProjects = projects.length;
    const totalViews = Math.floor(totalProjects * 150 + Math.random() * 500);
    const completionRate = Math.min(95, Math.floor(65 + Math.random() * 30));
    const averageEngagement = Math.min(95, Math.floor(70 + Math.random() * 25));
    const interactionRate = Math.min(95, Math.floor(75 + Math.random() * 20));

    // Generate daily views data for the past week
    const dailyViewsData = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      const views = Math.floor(Math.random() * 100) + 20;
      dailyViewsData.push({ date: dateString, views });
    }

    // Format projects for top performing content
    const topPerformingContent = projects
      .map(project => ({
        id: project.id,
        title: project.title,
        views: Math.floor(Math.random() * 300) + 50
      }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 4);

    // Format the response
    const analyticsData = {
      views: totalViews,
      completionRate,
      averageEngagement,
      interactionRate,
      dailyViewsData,
      topPerformingContent
    };

    return new Response(
      JSON.stringify(analyticsData),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch analytics data' }),
      { status: 500 }
    );
  }
});
