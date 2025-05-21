import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import { 
  PlusIcon, 
  BarChart4, 
  Clock, 
  Film as FilmIcon, 
  ClipboardList, 
  Sparkles, 
  Loader2, 
  Trash2, 
  AlertCircle 
} from 'lucide-react'
import { useContent, ProjectData } from '../contexts/ContentContext'
import { useAuth } from '../contexts/AuthContext'
import { toast } from 'sonner'
import { getAnalyticsData } from '../lib/api'
import { testSupabaseConnection } from '../lib/supabaseDebug'

export default function Dashboard() {
  const navigate = useNavigate()
  const { loadProjects, resetProject, deleteProject, isLoading: contentLoading } = useContent()
  const { user } = useAuth()
  const [projects, setProjects] = useState<ProjectData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [debugError, setDebugError] = useState<string | null>(null)
  const [stats, setStats] = useState({
    total: 0,
    duration: 0,
    completed: 0,
    views: 0
  })
  const [analyticsLoading, setAnalyticsLoading] = useState(false)
  const [analyticsError, setAnalyticsError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      setIsLoading(true)
      try {
        const connectionTest = await testSupabaseConnection()
        setDebugInfo(connectionTest)
        
        if (!connectionTest.success) {
          setDebugError('Supabase connection failed. Check console for details.')
          setIsLoading(false)
          return
        }
        
        const projectsData = await loadProjects()
        setProjects(projectsData)
        
        // Calculate basic stats
        setStats(prev => ({
          ...prev,
          total: projectsData.length,
          duration: projectsData.reduce((sum, project) => sum + (project.duration || 0), 0),
          completed: projectsData.filter(project => project.status === 'completed').length,
        }))
        
        // Now fetch analytics data
        setAnalyticsLoading(true)
        setAnalyticsError(null)
        try {
          const analyticsData = await getAnalyticsData()
          setStats(prev => ({
            ...prev,
            views: analyticsData.views
          }))
        } catch (analyticsError: any) {
          const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL || '').replace('https://', '')
          setAnalyticsError(
            'Failed to fetch analytics. This is usually a Supabase Edge Function deployment or network issue. ' +
            'Check that your function is deployed and reachable at: ' +
            (supabaseUrl ? `https://${supabaseUrl}/functions/v1/get-analytics` : '[Supabase URL not set]') +
            '\nError: ' + (analyticsError?.message || analyticsError)
          )
          console.error('Error loading analytics:', analyticsError)
        } finally {
          setAnalyticsLoading(false)
        }
      } catch (error) {
        console.error('Error loading projects:', error)
        setDebugError(error instanceof Error ? error.message : 'Unknown error loading projects')
        toast.error('Failed to load projects')
      } finally {
        setIsLoading(false)
      }
    }

    if (user) {
      fetchProjects()
    } else {
      // If no user, don't attempt to load projects and stop loading state
      setProjects([])
      setStats({
        total: 0,
        duration: 0,
        completed: 0,
        views: 0
      })
      setIsLoading(false)
    }
  }, [user, loadProjects])

  const handleCreateNewProject = () => {
    if (!user) {
      navigate('/auth')
      return
    }
    resetProject()
    navigate('/create')
  }

  const handleDeleteProject = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      const success = await deleteProject(id)
      if (success) {
        setProjects(projects.filter(project => project.id !== id))
        
        // Update stats
        setStats(prev => ({
          ...prev,
          total: prev.total - 1,
          duration: prev.duration - (projects.find(p => p.id === id)?.duration || 0),
          completed: prev.completed - (projects.find(p => p.id === id)?.status === 'completed' ? 1 : 0)
        }))
      }
    }
  }

  if (isLoading || contentLoading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 text-primary animate-spin" />
          <p className="text-animaker-text-light">Loading projects...</p>
        </div>
      </div>
    )
  }
  
  if (debugError) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] gap-4">
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg max-w-xl w-full">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <h2 className="text-lg font-semibold text-red-700">Connection Error</h2>
          </div>
          <p className="text-red-600 mb-4">{debugError}</p>
          
          {/* Display Supabase Connection Details */}
          <div className="mb-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Connection Details:</h3>
            <div className="bg-white p-3 rounded border border-red-100 overflow-auto max-h-60 text-xs">
              <div className="grid grid-cols-2 gap-1">
                <span className="font-medium">Authentication:</span>
                <span>{debugInfo?.authError ? 'Failed' : 'Success'}</span>
                
                <span className="font-medium">Database:</span>
                <span>{debugInfo?.dbErrors ? 'Failed' : 'Success'}</span>
                
                <span className="font-medium">User ID:</span>
                <span>{debugInfo?.authData?.user?.id || 'Not available'}</span>
                
                <span className="font-medium">Email:</span>
                <span>{debugInfo?.authData?.user?.email || 'Not available'}</span>
              </div>
            </div>
          </div>
          
          {/* Display Table Status */}
          {debugInfo?.dbErrors && (
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Database Errors:</h3>
              <div className="bg-white p-3 rounded border border-red-100 overflow-auto max-h-60 text-xs">
                <pre>{JSON.stringify(debugInfo.dbErrors, null, 2)}</pre>
              </div>
            </div>
          )}
          
          {/* Display Complete Debug Info for Developers */}
          <div className="mb-4">
            <details className="text-xs">
              <summary className="cursor-pointer text-blue-600 hover:text-blue-800">
                Show Complete Debug Information
              </summary>
              <div className="mt-2 bg-gray-100 p-3 rounded border border-gray-200 overflow-auto max-h-60">
                <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
              </div>
            </details>
          </div>
          
          <div className="mt-4 flex gap-2 justify-end">
            <a 
              href="https://app.supabase.com/project/_" 
              target="_blank" 
              rel="noopener noreferrer"
              className="px-3 py-1.5 text-sm text-blue-600 border border-blue-300 rounded hover:bg-blue-50"
            >
              Open Supabase
            </a>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Retry Connection
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Show analytics error if present
  if (analyticsError) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] gap-4">
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg max-w-xl w-full">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="h-5 w-5 text-yellow-500" />
            <h2 className="text-lg font-semibold text-yellow-700">Analytics Connection Error</h2>
          </div>
          <p className="text-yellow-700 mb-4 whitespace-pre-line">{analyticsError}</p>
          <div className="mt-4 flex gap-2 justify-end">
            <Button variant="outline" onClick={() => window.location.reload()}>
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 relative z-10">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-indigo-100/20 via-transparent to-transparent rounded-full blur-2xl -z-10" />
      <div className="absolute bottom-24 left-12 w-64 h-64 bg-gradient-to-tr from-primary/10 via-transparent to-transparent rounded-full blur-2xl -z-10" />

      {/* Header section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your AI-generated content projects
          </p>
        </div>
        <Button onClick={() => navigate('/create')} className="gap-2">
          <PlusIcon size={16} /> New Project
        </Button>
      </div>

      {/* Analytics cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{stats.total}</div>
              <ClipboardList className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Content Duration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{stats.duration} min</div>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{stats.completed}</div>
              <Sparkles className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Views</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{analyticsLoading ? '...' : stats.views}</div>
              <BarChart4 className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">All Projects</TabsTrigger>
          <TabsTrigger value="recent">Recent</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="space-y-4">
          {projects.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-gray-200 rounded-lg mt-8">
              <FilmIcon className="h-12 w-12 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">No projects yet</h3>
              <p className="text-gray-500 text-center max-w-md mb-6">
                Create your first interactive AI content project to get started
              </p>
              <Button onClick={() => navigate('/create')} className="gap-2">
                <PlusIcon size={16} />
                Create New Project
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {projects.map((project) => (
                <Link
                  key={project.id}
                  to={`/create?project=${project.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    resetProject();
                    navigate(`/create?project=${project.id}`);
                  }}
                >
                  <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg font-medium line-clamp-1">{project.title}</CardTitle>
                      <CardDescription className="line-clamp-2">{project.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="pb-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-animaker-text-light">Duration</p>
                          <p className="font-medium">{project.duration} mins</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <div>
                            <p className="text-animaker-text-light">Last Saved</p>
                            <p className="font-medium">
                              {project.lastSaved 
                                ? new Date(project.lastSaved).toLocaleDateString() 
                                : 'Not saved'}
                            </p>
                          </div>
                          <button 
                            onClick={(e) => {
                              e.preventDefault(); 
                              e.stopPropagation();
                              handleDeleteProject(project.id || '');
                            }}
                            className="text-animaker-text-light hover:text-destructive p-1 rounded-full transition-colors"
                            title="Delete project"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </TabsContent>
        <TabsContent value="recent" className="space-y-4">
          {/* Sort by most recent */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {projects
              .sort((a, b) => {
                const dateA = a.lastSaved ? new Date(a.lastSaved).getTime() : 0;
                const dateB = b.lastSaved ? new Date(b.lastSaved).getTime() : 0;
                return dateB - dateA;
              })
              .slice(0, 6)
              .map((project) => (
                <Link
                  key={project.id}
                  to={`/create?project=${project.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    resetProject();
                    navigate(`/create?project=${project.id}`);
                  }}
                >
                  <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg font-medium line-clamp-1">{project.title}</CardTitle>
                      <CardDescription className="line-clamp-2">{project.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="pb-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-animaker-text-light">Duration</p>
                          <p className="font-medium">{project.duration} mins</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <div>
                            <p className="text-animaker-text-light">Last Saved</p>
                            <p className="font-medium">
                              {project.lastSaved 
                                ? new Date(project.lastSaved).toLocaleDateString() 
                                : 'Not saved'}
                            </p>
                          </div>
                          <button 
                            onClick={(e) => {
                              e.preventDefault(); 
                              e.stopPropagation();
                              handleDeleteProject(project.id || '');
                            }}
                            className="text-animaker-text-light hover:text-destructive p-1 rounded-full transition-colors"
                            title="Delete project"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
          </div>
        </TabsContent>
        <TabsContent value="completed" className="space-y-4">
          {/* Filter by completed status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {projects
              .filter((project) => project.status === 'completed')
              .map((project) => (
                <Link
                  key={project.id}
                  to={`/create?project=${project.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    resetProject();
                    navigate(`/create?project=${project.id}`);
                  }}
                >
                  <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg font-medium line-clamp-1">{project.title}</CardTitle>
                      <CardDescription className="line-clamp-2">{project.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="pb-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-animaker-text-light">Duration</p>
                          <p className="font-medium">{project.duration} mins</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <div>
                            <p className="text-animaker-text-light">Last Saved</p>
                            <p className="font-medium">
                              {project.lastSaved 
                                ? new Date(project.lastSaved).toLocaleDateString() 
                                : 'Not saved'}
                            </p>
                          </div>
                          <button 
                            onClick={(e) => {
                              e.preventDefault(); 
                              e.stopPropagation();
                              handleDeleteProject(project.id || '');
                            }}
                            className="text-animaker-text-light hover:text-destructive p-1 rounded-full transition-colors"
                            title="Delete project"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}