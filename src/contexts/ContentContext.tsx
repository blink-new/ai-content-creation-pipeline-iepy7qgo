import { createContext, useContext, useState, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';
import * as api from '../lib/api';

export interface StoryboardFrame {
  id: string;
  imageUrl: string;
  description: string;
  timestamp: number;
}

export interface Interaction {
  id: string;
  type: 'quiz' | 'decision' | 'info';
  title: string;
  description: string;
  options?: string[];
  timestamp: number;
}

export interface VoiceOver {
  id: string;
  text: string;
  voiceId: string;
  timestamp: number;
  duration: number;
  audioUrl?: string;
}

export interface ProjectData {
  id?: string;
  title: string;
  description: string;
  script: string;
  storyboardFrames: StoryboardFrame[];
  selectedAvatars: string[];
  interactions: Interaction[];
  voiceOvers: VoiceOver[];
  duration: number;
  status: 'draft' | 'in-progress' | 'completed';
  lastSaved?: Date;
}

// Initial empty project state
const initialProject: ProjectData = {
  title: '',
  description: '',
  script: '',
  storyboardFrames: [],
  selectedAvatars: [],
  interactions: [],
  voiceOvers: [],
  duration: 0,
  status: 'draft',
};

interface ContentContextType {
  currentProject: ProjectData;
  setCurrentProject: React.Dispatch<React.SetStateAction<ProjectData>>;
  updateScript: (script: string) => void;
  updateStoryboardFrames: (frames: StoryboardFrame[]) => void;
  updateSelectedAvatars: (avatarIds: string[]) => void;
  addInteraction: (interaction: Interaction) => void;
  removeInteraction: (interactionId: string) => void;
  updateInteraction: (interaction: Interaction) => void;
  addVoiceOver: (voiceOver: VoiceOver) => void;
  removeVoiceOver: (voiceOverId: string) => void;
  updateVoiceOver: (voiceOver: VoiceOver) => void;
  updateTitle: (title: string) => void;
  updateDescription: (description: string) => void;
  resetProject: () => void;
  saveProject: () => Promise<boolean>;
  loadProjects: () => Promise<ProjectData[]>;
  loadProject: (id: string) => Promise<boolean>;
  deleteProject: (id: string) => Promise<boolean>;
  isLoading: boolean;
}

const ContentContext = createContext<ContentContextType | undefined>(undefined);

export function ContentProvider({ children }: { children: ReactNode }) {
  const [currentProject, setCurrentProject] = useState<ProjectData>(initialProject);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  // Update script and automatically calculate duration
  const updateScript = (script: string) => {
    const wordCount = script.trim().split(/\s+/).length;
    // Rough estimate: 150 words per minute
    const estimatedDuration = Math.max(Math.round(wordCount / 150 * 60), 30);
    
    setCurrentProject(prev => ({
      ...prev,
      script,
      duration: estimatedDuration,
    }));
  };

  // Update storyboard frames
  const updateStoryboardFrames = (frames: StoryboardFrame[]) => {
    setCurrentProject(prev => ({
      ...prev,
      storyboardFrames: frames,
    }));
  };

  // Update selected avatars
  const updateSelectedAvatars = (avatarIds: string[]) => {
    // Only update if the array has actually changed
    if (JSON.stringify(currentProject.selectedAvatars) !== JSON.stringify(avatarIds)) {
      setCurrentProject(prev => ({
        ...prev,
        selectedAvatars: avatarIds,
      }));
    }
  };

  // Add a new interaction
  const addInteraction = (interaction: Interaction) => {
    setCurrentProject(prev => ({
      ...prev,
      interactions: [...prev.interactions, interaction],
    }));
  };

  // Remove an interaction
  const removeInteraction = (interactionId: string) => {
    setCurrentProject(prev => ({
      ...prev,
      interactions: prev.interactions.filter(item => item.id !== interactionId),
    }));
  };

  // Update an existing interaction
  const updateInteraction = (interaction: Interaction) => {
    setCurrentProject(prev => ({
      ...prev,
      interactions: prev.interactions.map(item => 
        item.id === interaction.id ? interaction : item
      ),
    }));
  };

  // Add a new voice over
  const addVoiceOver = (voiceOver: VoiceOver) => {
    setCurrentProject(prev => ({
      ...prev,
      voiceOvers: [...prev.voiceOvers, voiceOver],
    }));
  };

  // Remove a voice over
  const removeVoiceOver = (voiceOverId: string) => {
    setCurrentProject(prev => ({
      ...prev,
      voiceOvers: prev.voiceOvers.filter(item => item.id !== voiceOverId),
    }));
  };

  // Update an existing voice over
  const updateVoiceOver = (voiceOver: VoiceOver) => {
    setCurrentProject(prev => ({
      ...prev,
      voiceOvers: prev.voiceOvers.map(item => 
        item.id === voiceOver.id ? voiceOver : item
      ),
    }));
  };

  // Update project title
  const updateTitle = (title: string) => {
    setCurrentProject(prev => ({
      ...prev,
      title,
    }));
  };

  // Update project description
  const updateDescription = (description: string) => {
    setCurrentProject(prev => ({
      ...prev,
      description,
    }));
  };

  // Reset project to initial state
  const resetProject = () => {
    setCurrentProject(initialProject);
  };

  // Load all projects for the current user
  const loadProjects = async (): Promise<ProjectData[]> => {
    if (!user) return [];
    
    setIsLoading(true);
    try {
      const projects = await api.getProjects();
      return projects;
    } catch (error) {
      console.error('Error loading projects:', error);
      toast.error('Failed to load projects');
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // Load a specific project by ID
  const loadProject = async (id: string): Promise<boolean> => {
    if (!user) return false;
    
    setIsLoading(true);
    try {
      const project = await api.getProject(id);
      setCurrentProject(project);
      return true;
    } catch (error) {
      console.error('Error loading project:', error);
      toast.error('Failed to load project');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Delete a project by ID
  const deleteProject = async (id: string): Promise<boolean> => {
    if (!user) return false;
    
    setIsLoading(true);
    try {
      const success = await api.deleteProject(id);
      if (success) {
        toast.success('Project deleted successfully');
      }
      return success;
    } catch (error) {
      console.error('Error deleting project:', error);
      toast.error('Failed to delete project');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Save project to Supabase
  const saveProject = async (): Promise<boolean> => {
    if (!user) {
      toast.error('You must be logged in to save a project');
      return false;
    }
    
    if (!currentProject.title) {
      toast.error('Project title is required');
      return false;
    }
    
    setIsLoading(true);
    
    try {
      const savedProject = await api.saveProject(currentProject);
      
      if (savedProject) {
        // If this was a new project, update the current project with the new ID
        if (!currentProject.id) {
          setCurrentProject(prev => ({
            ...prev,
            id: savedProject.id,
            lastSaved: new Date(),
          }));
        } else {
          setCurrentProject(prev => ({
            ...prev,
            lastSaved: new Date(),
          }));
        }
        
        toast.success('Project saved successfully');
        return true;
      } else {
        throw new Error('Failed to save project');
      }
    } catch (error) {
      console.error('Error saving project:', error);
      toast.error('Failed to save project');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    currentProject,
    setCurrentProject,
    updateScript,
    updateStoryboardFrames,
    updateSelectedAvatars,
    addInteraction,
    removeInteraction,
    updateInteraction,
    addVoiceOver,
    removeVoiceOver,
    updateVoiceOver,
    updateTitle,
    updateDescription,
    resetProject,
    saveProject,
    loadProjects,
    loadProject,
    deleteProject,
    isLoading,
  };

  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>;
}

export function useContent() {
  const context = useContext(ContentContext);
  if (context === undefined) {
    throw new Error('useContent must be used within a ContentProvider');
  }
  return context;
}