import { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Textarea } from '../components/ui/textarea'
import { Input } from '../components/ui/input'
import { ScrollArea } from '../components/ui/scroll-area'
import { 
  PlusIcon, 
  TrashIcon, 
  MessageSquare, 
  RefreshCcw, 
  PlayCircle, 
  PauseCircle, 
  Wand2, 
  Video, 
  Lightbulb,
  Save,
  AlertCircle,
  Loader2
} from 'lucide-react'
import { getAvatars, Avatar, generateScript, generateStoryboardFrames } from '../lib/api'
import { useContent } from '../contexts/ContentContext'
import { useToast } from '../hooks/use-toast'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog'
import { Label } from '../components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'

export default function ContentCreator() {
  const { toast } = useToast()
  const { 
    currentProject, 
    updateScript, 
    updateStoryboardFrames,
    updateSelectedAvatars,
    saveProject,
    updateTitle,
    updateDescription
  } = useContent()
  
  const [activeTab, setActiveTab] = useState('script')
  const [isGenerating, setIsGenerating] = useState(false)
  const [isGeneratingFrames, setIsGeneratingFrames] = useState(false)
  const [scriptPrompt, setScriptPrompt] = useState('')
  const [scriptLength, setScriptLength] = useState<'short' | 'medium' | 'long'>('medium')
  const [showPromptDialog, setShowPromptDialog] = useState(false)
  const [avatars, setAvatars] = useState<Avatar[]>([])
  const [isLoadingAvatars, setIsLoadingAvatars] = useState(false)

  useEffect(() => {
    async function fetchAvatars() {
      setIsLoadingAvatars(true)
      try {
        const avatarData = await getAvatars()
        setAvatars(avatarData)
      } catch (error) {
        console.error('Failed to load avatars:', error)
        toast({
          title: "Failed to load avatars",
          description: "Could not retrieve avatar data. Please try again later.",
          variant: "destructive"
        })
      } finally {
        setIsLoadingAvatars(false)
      }
    }
    
    fetchAvatars()
  }, [toast])

  const handleScriptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateScript(e.target.value)
  }

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateTitle(e.target.value)
  }

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateDescription(e.target.value)
  }

  const handleGenerateScript = async () => {
    if (!scriptPrompt.trim()) {
      toast({
        title: "Script Prompt Required",
        description: "Please enter a prompt to generate a script.",
        variant: "destructive"
      })
      return
    }

    setIsGenerating(true)
    try {
      const generatedScript = await generateScript(scriptPrompt, scriptLength)
      updateScript(generatedScript)
      setShowPromptDialog(false)
      toast({
        title: "Script Generated",
        description: "Your AI script has been generated successfully.",
      })
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "There was an error generating your script. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleGenerateStoryboard = async () => {
    if (!currentProject.script) {
      toast({
        title: "Script Required",
        description: "Please generate or write a script first.",
        variant: "destructive"
      })
      return
    }

    setIsGeneratingFrames(true)
    try {
      const frames = await generateStoryboardFrames(currentProject.script)
      const storyboardFrames = frames.map((frame, index) => ({
        id: `frame-${Date.now()}-${index}`,
        scenarioId: currentProject.id || 'new-scenario',
        order: index,
        description: frame.description,
        imageUrl: frame.imageUrl,
        duration: frame.duration
      }))
      
      updateStoryboardFrames(storyboardFrames)
      setActiveTab('storyboard')
      toast({
        title: "Storyboard Generated",
        description: "Your storyboard has been generated from your script.",
      })
    } catch (error) {
      toast({
        title: "Storyboard Generation Failed",
        description: "There was an error generating your storyboard. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsGeneratingFrames(false)
    }
  }

  const handleSaveDraft = async () => {
    if (!currentProject.title) {
      toast({
        title: "Title Required",
        description: "Please enter a title for your project.",
        variant: "destructive"
      })
      return
    }

    try {
      await saveProject()
      toast({
        title: "Draft Saved",
        description: "Your project has been saved as a draft.",
      })
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "There was an error saving your project. Please try again.",
        variant: "destructive"
      })
    }
  }

  const toggleAvatarSelection = (avatarId: string) => {
    const newSelectedAvatars = currentProject.selectedAvatars.includes(avatarId)
      ? currentProject.selectedAvatars.filter(id => id !== avatarId)
      : [...currentProject.selectedAvatars, avatarId];
    
    updateSelectedAvatars(newSelectedAvatars);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Content Creator</h1>
          <p className="text-muted-foreground mt-1">
            Create and edit your training content
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleSaveDraft}>
            <Save className="mr-2 h-4 w-4" />
            Save Draft
          </Button>
          <Button>Publish</Button>
        </div>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="project-title">Project Title</Label>
              <Input 
                id="project-title" 
                placeholder="Enter project title" 
                value={currentProject.title}
                onChange={handleTitleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="project-description">Short Description</Label>
              <Input 
                id="project-description" 
                placeholder="Brief description of your content" 
                value={currentProject.description}
                onChange={handleDescriptionChange}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid grid-cols-3 md:grid-cols-5">
              <TabsTrigger value="script">Script</TabsTrigger>
              <TabsTrigger value="storyboard">Storyboard</TabsTrigger>
              <TabsTrigger value="avatars">Avatars</TabsTrigger>
              <TabsTrigger value="voice">Voice</TabsTrigger>
              <TabsTrigger value="interactions">Interactions</TabsTrigger>
            </TabsList>
            
            <TabsContent value="script" className="space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle>Script Editor</CardTitle>
                    <div className="flex gap-2">
                      <Dialog open={showPromptDialog} onOpenChange={setShowPromptDialog}>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Prompt AI
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Generate AI Script</DialogTitle>
                            <DialogDescription>
                              Describe the content you want to create and we'll generate a script for you.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <Label htmlFor="prompt">Prompt</Label>
                              <Textarea
                                id="prompt"
                                placeholder="E.g., Create a customer service training scenario about handling difficult customers"
                                value={scriptPrompt}
                                onChange={(e) => setScriptPrompt(e.target.value)}
                                className="min-h-[100px]"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="length">Script Length</Label>
                              <Select
                                value={scriptLength}
                                onValueChange={(value) => setScriptLength(value as 'short' | 'medium' | 'long')}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select length" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="short">Short (1-2 min)</SelectItem>
                                  <SelectItem value="medium">Medium (3-5 min)</SelectItem>
                                  <SelectItem value="long">Long (6-10 min)</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <DialogFooter>
                            <Button onClick={handleGenerateScript} disabled={isGenerating}>
                              {isGenerating ? (
                                <>
                                  <RefreshCcw className="mr-2 h-4 w-4 animate-spin" />
                                  Generating...
                                </>
                              ) : (
                                <>
                                  <Wand2 className="mr-2 h-4 w-4" />
                                  Generate Script
                                </>
                              )}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                      
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={handleGenerateStoryboard} 
                        disabled={isGeneratingFrames || !currentProject.script}
                      >
                        {isGeneratingFrames ? (
                          <>
                            <RefreshCcw className="h-4 w-4 mr-2 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Wand2 className="h-4 w-4 mr-2" />
                            Generate Storyboard
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Textarea 
                    className="min-h-[300px] font-mono"
                    placeholder="Enter your script here or use AI to generate one..."
                    value={currentProject.script}
                    onChange={handleScriptChange}
                  />
                </CardContent>
                <CardFooter className="text-sm text-muted-foreground">
                  {currentProject.script ? (
                    <div className="flex items-center">
                      <span>
                        {currentProject.script.split(/\s+/).filter(Boolean).length} words | 
                        Estimated duration: {Math.ceil(currentProject.duration / 60)} min {currentProject.duration % 60} sec
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <AlertCircle className="h-4 w-4 mr-2" />
                      <span>No script yet. Write one or use the AI generator.</span>
                    </div>
                  )}
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle>AI Script Suggestions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="rounded-md border p-4 bg-muted/50">
                      <div className="flex items-center gap-2 mb-2">
                        <Lightbulb className="h-4 w-4 text-yellow-500" />
                        <p className="font-medium">Improve Engagement</p>
                      </div>
                      <p className="text-sm">Consider adding an interactive question after the introduction to engage learners early.</p>
                      <div className="mt-2 flex justify-end">
                        <Button variant="ghost" size="sm">
                          Apply
                        </Button>
                      </div>
                    </div>
                    
                    <div className="rounded-md border p-4 bg-muted/50">
                      <div className="flex items-center gap-2 mb-2">
                        <Lightbulb className="h-4 w-4 text-yellow-500" />
                        <p className="font-medium">Add Conversational Elements</p>
                      </div>
                      <p className="text-sm">Transform the monologue into a dialogue between a customer service rep and a customer.</p>
                      <div className="mt-2 flex justify-end">
                        <Button variant="ghost" size="sm">
                          Apply
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="storyboard" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Storyboard</CardTitle>
                    <div className="flex gap-2">
                      {currentProject.script && (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={handleGenerateStoryboard}
                          disabled={isGeneratingFrames}
                        >
                          {isGeneratingFrames ? (
                            <>
                              <RefreshCcw className="h-4 w-4 mr-2 animate-spin" />
                              Generating...
                            </>
                          ) : (
                            <>
                              <Wand2 className="h-4 w-4 mr-2" />
                              Regenerate
                            </>
                          )}
                        </Button>
                      )}
                      <Button size="sm">
                        <PlusIcon className="h-4 w-4 mr-2" />
                        Add Frame
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {currentProject.storyboardFrames.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <Video className="h-16 w-16 text-muted-foreground/50 mb-4" />
                      <h3 className="text-lg font-medium mb-2">No Storyboard Frames Yet</h3>
                      <p className="text-muted-foreground max-w-md mb-4">
                        Generate storyboard frames from your script or add frames manually.
                      </p>
                      <Button 
                        onClick={handleGenerateStoryboard} 
                        disabled={isGeneratingFrames || !currentProject.script}
                      >
                        <Wand2 className="mr-2 h-4 w-4" />
                        Generate from Script
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {currentProject.storyboardFrames.map((frame, i) => (
                        <div key={frame.id} className="border rounded-md overflow-hidden">
                          <div className="aspect-video bg-muted flex items-center justify-center overflow-hidden">
                            {frame.imageUrl ? (
                              <img 
                                src={frame.imageUrl} 
                                alt={`Scene ${i + 1}`} 
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Video className="h-8 w-8 text-muted-foreground/50" />
                            )}
                          </div>
                          <div className="p-3">
                            <p className="font-medium text-sm">Scene {i + 1}</p>
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              {frame.description}
                            </p>
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-xs text-muted-foreground">Duration: {frame.duration}s</span>
                              <Button variant="ghost" size="sm">
                                <TrashIcon className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="avatars" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Available Avatars</CardTitle>
                    <Button size="sm">
                      <PlusIcon className="h-4 w-4 mr-2" />
                      Create Avatar
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {isLoadingAvatars ? (
                      <div className="col-span-4 flex justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      </div>
                    ) : (
                      avatars.map((avatar) => (
                        <div 
                          key={avatar.id} 
                          className={`border rounded-md overflow-hidden cursor-pointer transition-all ${ 
                            currentProject.selectedAvatars.includes(avatar.id) 
                              ? 'ring-2 ring-primary ring-offset-2' 
                              : 'hover:border-primary'
                          }`}
                          onClick={() => toggleAvatarSelection(avatar.id)}
                        >
                          <div className="aspect-square overflow-hidden">
                            <img 
                              src={avatar.imageUrl} 
                              alt={avatar.name}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div className="p-3">
                            <p className="font-medium text-sm">{avatar.name}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {avatar.gender.charAt(0).toUpperCase() + avatar.gender.slice(1)}, {avatar.appearance}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="voice" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Voice Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="rounded-md border p-4">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full overflow-hidden">
                          <img 
                            src={avatars[0].imageUrl} 
                            alt={avatars[0].name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{avatars[0].name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                              <div className="bg-primary h-full w-3/4"></div>
                            </div>
                            <PlayCircle className="h-5 w-5 text-primary cursor-pointer" />
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="rounded-md border p-4">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full overflow-hidden">
                          <img 
                            src={avatars[1].imageUrl} 
                            alt={avatars[1].name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{avatars[1].name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                              <div className="bg-primary h-full w-2/4"></div>
                            </div>
                            <PauseCircle className="h-5 w-5 text-primary cursor-pointer" />
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <Button className="w-full">
                        <Wand2 className="mr-2 h-4 w-4" />
                        Clone New Voice
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="interactions" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Interactive Elements</CardTitle>
                    <div className="flex gap-2">
                      <select className="px-2 py-1 rounded-md border text-sm">
                        <option>Quiz Question</option>
                        <option>Decision Point</option>
                        <option>Hotspot</option>
                        <option>Poll</option>
                      </select>
                      <Button size="sm">
                        <PlusIcon className="h-4 w-4 mr-2" />
                        Add Interaction
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-4">
                      <div className="rounded-md border p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100 px-2 py-1 rounded-full text-xs">Quiz</span>
                            <h4 className="font-medium">Customer Satisfaction</h4>
                          </div>
                          <p className="text-sm text-muted-foreground">00:45</p>
                        </div>
                        <p className="mt-2 text-sm">Which approach would likely result in the highest customer satisfaction?</p>
                        <div className="mt-3 space-y-2">
                          <div className="flex items-center gap-2">
                            <Input type="radio" className="h-4 w-4" id="opt1" name="quiz1" />
                            <label htmlFor="opt1" className="text-sm">Offering a quick solution without fully listening to the problem</label>
                          </div>
                          <div className="flex items-center gap-2">
                            <Input type="radio" className="h-4 w-4" id="opt2" name="quiz1" />
                            <label htmlFor="opt2" className="text-sm">Actively listening, then proposing personalized solutions</label>
                          </div>
                          <div className="flex items-center gap-2">
                            <Input type="radio" className="h-4 w-4" id="opt3" name="quiz1" />
                            <label htmlFor="opt3" className="text-sm">Transferring to another department</label>
                          </div>
                          <div className="flex items-center gap-2">
                            <Input type="radio" className="h-4 w-4" id="opt4" name="quiz1" />
                            <label htmlFor="opt4" className="text-sm">Following the script exactly as written</label>
                          </div>
                        </div>
                      </div>
                      
                      <div className="rounded-md border p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-100 px-2 py-1 rounded-full text-xs">Decision</span>
                            <h4 className="font-medium">Difficult Customer</h4>
                          </div>
                          <p className="text-sm text-muted-foreground">02:00</p>
                        </div>
                        <p className="mt-2 text-sm">The customer is becoming increasingly frustrated. What do you do?</p>
                        <div className="mt-3 space-y-2">
                          <div className="flex items-center gap-2">
                            <Input type="radio" className="h-4 w-4" id="dec1" name="decision1" />
                            <label htmlFor="dec1" className="text-sm">Remain calm and empathize with their situation</label>
                          </div>
                          <div className="flex items-center gap-2">
                            <Input type="radio" className="h-4 w-4" id="dec2" name="decision1" />
                            <label htmlFor="dec2" className="text-sm">Offer to escalate to a supervisor</label>
                          </div>
                          <div className="flex items-center gap-2">
                            <Input type="radio" className="h-4 w-4" id="dec3" name="decision1" />
                            <label htmlFor="dec3" className="text-sm">Propose a specific solution to their problem</label>
                          </div>
                          <div className="flex items-center gap-2">
                            <Input type="radio" className="h-4 w-4" id="dec4" name="decision1" />
                            <label htmlFor="dec4" className="text-sm">Put them on hold while you research options</label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-video bg-muted rounded-md flex items-center justify-center mb-4">
                <PlayCircle className="h-16 w-16 text-primary opacity-70 hover:opacity-100 cursor-pointer transition-opacity" />
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium">Project</p>
                  <p className="text-sm text-muted-foreground">
                    {currentProject.title || "Untitled Project"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Duration</p>
                  <p className="text-sm text-muted-foreground">
                    {Math.floor(currentProject.duration / 60)}:{(currentProject.duration % 60).toString().padStart(2, '0')} min
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Avatars</p>
                  <div className="flex mt-1 -space-x-2">
                    {currentProject.selectedAvatars.map((id) => {
                      const avatar = avatars.find(a => a.id === id)
                      return avatar ? (
                        <div key={id} className="h-8 w-8 rounded-full border-2 border-background overflow-hidden">
                          <img 
                            src={avatar.imageUrl} 
                            alt={avatar.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      ) : null
                    })}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium">Interactions</p>
                  <p className="text-sm text-muted-foreground">
                    {currentProject.interactions.length > 0 
                      ? `${currentProject.interactions.filter(i => i.type === 'quiz').length} Quiz Questions, ${currentProject.interactions.filter(i => i.type === 'decision').length} Decision Points`
                      : "No interactions added yet"
                    }
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Status</p>
                  <div className="mt-1">
                    <span className={`text-xs px-2 py-1 rounded-full ${ 
                      currentProject.status === 'completed' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' 
                        : currentProject.status === 'in-progress'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100'
                    }`}>
                      {currentProject.status === 'in-progress' ? 'In Progress' : 
                      currentProject.status.charAt(0).toUpperCase() + currentProject.status.slice(1)}
                    </span>
                  </div>
                </div>
                {currentProject.lastSaved && (
                  <div>
                    <p className="text-sm font-medium">Last Saved</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(currentProject.lastSaved).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}