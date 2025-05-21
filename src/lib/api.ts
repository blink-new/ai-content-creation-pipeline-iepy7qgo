import { supabase } from './supabaseClient';

export interface Avatar {
  id: string;
  name: string;
  gender: 'male' | 'female' | 'neutral';
  appearance: string;
  imageUrl: string;
  voiceId?: string;
}

export interface VoiceOver {
  id: string;
  name: string;
  avatarId?: string;
  audioUrl?: string;
  transcript: string;
  duration: number;
  createdAt?: string;
  settings?: Record<string, any>;
  avatar?: Avatar;
}

export interface StoryboardFrame {
  id?: string;
  scenarioId?: string;
  order?: number;
  imageUrl: string;
  description: string;
  duration: number;
  timestamp?: number;
}

export interface AnalyticsData {
  views: number;
  completionRate: number;
  averageEngagement: number;
  interactionRate: number;
  dailyViewsData: { date: string; views: number }[];
  topPerformingContent: { id: string; title: string; views: number }[];
}

export interface VoiceAnalysisResults {
  clarity: number;
  emotion: number;
  pace: number;
  engagement: number;
  recommendations: string[];
}

// Call the Supabase Edge Function for script generation
export async function generateScript(prompt: string, length: 'short' | 'medium' | 'long') {
  try {
    const { data, error } = await supabase.functions.invoke('generate-script', {
      body: JSON.stringify({ prompt, length }),
    });
    
    if (error) throw new Error(error.message || 'Failed to generate script');
    return data.script;
  } catch (error) {
    console.error('Error generating script:', error);
    throw new Error('Failed to generate script');
  }
}

// Call the Supabase Edge Function for storyboard generation
export async function generateStoryboardFrames(script: string): Promise<StoryboardFrame[]> {
  try {
    const { data, error } = await supabase.functions.invoke('generate-storyboard', {
      body: JSON.stringify({ script }),
    });
    
    if (error) throw new Error(error.message || 'Failed to generate storyboard');
    
    return data.frames.map((frame: StoryboardFrame, index: number) => ({
      id: `frame-${Date.now()}-${index}`,
      order: index,
      imageUrl: frame.imageUrl,
      description: frame.description,
      duration: frame.duration,
      timestamp: index * 5 // Rough timestamp estimate
    }));
  } catch (error) {
    console.error('Error generating storyboard:', error);
    throw new Error('Failed to generate storyboard frames');
  }
}

// Get all avatars
export async function getAvatars(): Promise<Avatar[]> {
  try {
    const { data, error } = await supabase.functions.invoke('get-avatars');
    
    if (error) throw new Error(error.message || 'Failed to fetch avatars');
    return data;
  } catch (error) {
    console.error('Error fetching avatars:', error);
    throw new Error('Failed to fetch avatars');
  }
}

// Clone voice
export async function cloneVoice(
  name: string, 
  sampleText: string, 
  settings: Record<string, number>,
  avatarId?: string
): Promise<VoiceOver> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');
    
    const { data, error } = await supabase.functions.invoke('clone-voice', {
      body: JSON.stringify({ 
        name, 
        sampleText, 
        settings,
        avatarId,
        userId: user.id
      }),
    });
    
    if (error) throw new Error(error.message || 'Failed to clone voice');
    return data;
  } catch (error) {
    console.error('Error cloning voice:', error);
    throw new Error('Failed to clone voice');
  }
}

// Get all voice overs
export async function getVoiceOvers(): Promise<VoiceOver[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');
    
    const { data, error } = await supabase.functions.invoke('get-voice-overs', {
      body: { userId: user.id },
    });
    
    if (error) throw new Error(error.message || 'Failed to fetch voice overs');
    return data;
  } catch (error) {
    console.error('Error fetching voice overs:', error);
    throw new Error('Failed to fetch voice overs');
  }
}

// Analyze voice performance
export async function analyzeVoicePerformance(voiceId: string): Promise<VoiceAnalysisResults> {
  try {
    const { data, error } = await supabase.functions.invoke('analyze-voice', {
      body: JSON.stringify({ voiceId }),
    });
    
    if (error) throw new Error(error.message || 'Failed to analyze voice');
    return data;
  } catch (error) {
    console.error('Error analyzing voice:', error);
    throw new Error('Failed to analyze voice');
  }
}

// Get analytics data
export async function getAnalyticsData(): Promise<AnalyticsData> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');
    
    const { data, error } = await supabase.functions.invoke('get-analytics', {
      body: { userId: user.id },
    });
    
    if (error) throw new Error(error.message || 'Failed to fetch analytics');
    return data;
  } catch (error) {
    console.error('Error fetching analytics:', error);
    throw new Error('Failed to fetch analytics');
  }
}

// Save a project to the database
export async function saveProject(projectData: any) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');
    
    const formattedData = {
      user_id: user.id,
      title: projectData.title,
      description: projectData.description,
      script: projectData.script,
      storyboard_frames: projectData.storyboardFrames,
      selected_avatars: projectData.selectedAvatars,
      interactions: projectData.interactions,
      voice_overs: projectData.voiceOvers,
      duration: projectData.duration,
      status: projectData.status,
    };
    
    let response;
    
    if (projectData.id) {
      // Update existing project
      response = await supabase
        .from('projects')
        .update(formattedData)
        .eq('id', projectData.id);
    } else {
      // Insert new project
      response = await supabase
        .from('projects')
        .insert(formattedData)
        .select();
    }
    
    if (response.error) throw response.error;
    
    return response.data ? response.data[0] : null;
  } catch (error) {
    console.error('Error saving project:', error);
    throw new Error('Failed to save project');
  }
}

// Get all projects for the current user
export async function getProjects() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');
    
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });
    
    if (error) throw error;
    
    return data.map((project: any) => ({
      id: project.id,
      title: project.title,
      description: project.description,
      script: project.script,
      storyboardFrames: project.storyboard_frames || [],
      selectedAvatars: project.selected_avatars || [],
      interactions: project.interactions || [],
      voiceOvers: project.voice_overs || [],
      duration: project.duration,
      status: project.status,
      lastSaved: new Date(project.updated_at),
    }));
  } catch (error) {
    console.error('Error loading projects:', error);
    throw new Error('Failed to load projects');
  }
}

// Get a single project by ID
export async function getProject(id: string) {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      title: data.title,
      description: data.description,
      script: data.script,
      storyboardFrames: data.storyboard_frames || [],
      selectedAvatars: data.selected_avatars || [],
      interactions: data.interactions || [],
      voiceOvers: data.voice_overs || [],
      duration: data.duration,
      status: data.status,
      lastSaved: new Date(data.updated_at),
    };
  } catch (error) {
    console.error('Error loading project:', error);
    throw new Error('Failed to load project');
  }
}

// Delete a project by ID
export async function deleteProject(id: string) {
  try {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error deleting project:', error);
    throw new Error('Failed to delete project');
  }
}