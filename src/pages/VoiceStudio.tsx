import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import { Input } from '../components/ui/input'
import { Textarea } from '../components/ui/textarea'
import { Slider } from '../components/ui/slider'
import { Label } from '../components/ui/label'
import { 
  PlusIcon, 
  PlayIcon, 
  PauseIcon, 
  SaveIcon, 
  MicIcon, 
  Wand2, 
  RefreshCcw, 
  Download,
  Volume2,
  BarChart,
  Trash,
  FileAudio,
  Loader2
} from 'lucide-react'
import { getAvatars, getVoiceOvers, cloneVoice, analyzeVoicePerformance, Avatar, VoiceOver } from '../lib/api'
import { useToast } from '../hooks/use-toast'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog'
import { useContent } from '../contexts/ContentContext'

export default function VoiceStudio() {
  const { toast } = useToast()
  const { currentProject, addVoiceOver } = useContent()
  
  const [activeTab, setActiveTab] = useState('library')
  const [isGenerating, setIsGenerating] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [sampleText, setSampleText] = useState("Welcome to our interactive training session. Today we'll explore effective communication techniques.")
  const [voiceName, setVoiceName] = useState('')
  const [voiceDescription, setVoiceDescription] = useState('')
  const [selectedAvatarId, setSelectedAvatarId] = useState('')
  const [selectedVoiceId, setSelectedVoiceId] = useState('')
  const [voiceSettings, setVoiceSettings] = useState({
    pitch: 50,
    speed: 50,
    clarity: 75,
    emotion: 50,
  })
  const [showAnalysisDialog, setShowAnalysisDialog] = useState(false)
  const [analysisResults, setAnalysisResults] = useState<{
    clarity: number,
    emotion: number,
    pace: number,
    engagement: number,
    recommendations: string[]
  } | null>(null)
  const [avatars, setAvatars] = useState<Avatar[]>([])
  const [voiceOvers, setVoiceOvers] = useState<VoiceOver[]>([])
  const [isLoadingAvatars, setIsLoadingAvatars] = useState(false)
  const [isLoadingVoiceOvers, setIsLoadingVoiceOvers] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      setIsLoadingAvatars(true)
      setIsLoadingVoiceOvers(true)
      
      try {
        const [avatarData, voiceOverData] = await Promise.all([
          getAvatars(),
          getVoiceOvers()
        ])
        
        setAvatars(avatarData)
        setVoiceOvers(voiceOverData)
      } catch (error) {
        console.error('Failed to load data:', error)
        toast({
          title: "Failed to load data",
          description: "Could not retrieve avatars or voice overs. Please try again later.",
          variant: "destructive"
        })
      } finally {
        setIsLoadingAvatars(false)
        setIsLoadingVoiceOvers(false)
      }
    }
    
    fetchData()
  }, [toast])

  const handleSettingChange = (setting: keyof typeof voiceSettings, value: number[]) => {
    setVoiceSettings({
      ...voiceSettings,
      [setting]: value[0],
    })
  }

  const handleGenerateVoice = async () => {
    if (!voiceName) {
      toast({
        title: "Voice Name Required",
        description: "Please enter a name for your voice clone.",
        variant: "destructive"
      })
      return
    }

    if (!sampleText) {
      toast({
        title: "Sample Text Required",
        description: "Please enter sample text for voice generation.",
        variant: "destructive"
      })
      return
    }

    setIsGenerating(true)
    try {
      const newVoice = await cloneVoice(voiceName, sampleText, voiceSettings, selectedAvatarId || undefined)
      
      // Add to context and local state
      addVoiceOver({
        ...newVoice,
        id: newVoice.id,
        text: newVoice.transcript,
        timestamp: 0,
        voiceId: newVoice.id
      })
      
      // Update voice overs state
      setVoiceOvers(prev => [...prev, newVoice])
      
      // Reset form
      setVoiceName('')
      setVoiceDescription('')
      setSampleText('')
      setSelectedAvatarId('')
      
      // Show success message
      toast({
        title: "Voice Generated",
        description: "Your voice clone has been successfully created.",
      })
      
      // Switch to library tab
      setActiveTab('library')
    } catch (error) {
      toast({
        title: "Voice Generation Failed",
        description: "There was an error generating your voice. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleAnalyzeVoice = async () => {
    if (!selectedVoiceId) {
      toast({
        title: "No Voice Selected",
        description: "Please select a voice to analyze.",
        variant: "destructive"
      })
      return
    }
    
    setIsAnalyzing(true)
    try {
      // Call analysis API
      const results = await analyzeVoicePerformance(selectedVoiceId)
      setAnalysisResults(results)
      setShowAnalysisDialog(true)
    } catch (error) {
      toast({
        title: "Analysis Failed",
        description: "There was an error analyzing the voice. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

  const getSettingLabel = (setting: keyof typeof voiceSettings, value: number) => {
    switch (setting) {
      case 'pitch':
        if (value < 30) return 'Low'
        if (value > 70) return 'High'
        return 'Normal'
      case 'speed':
        return `${(value / 50).toFixed(1)}x`
      case 'clarity':
        if (value < 30) return 'Low'
        if (value > 70) return 'High'
        return 'Medium'
      case 'emotion':
        if (value < 30) return 'Flat'
        if (value > 70) return 'Expressive'
        return 'Neutral'
      default:
        return value.toString()
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Voice Studio</h1>
          <p className="text-muted-foreground mt-1">
            Create and manage voice clones for your avatars
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <PlusIcon className="mr-2 h-4 w-4" />
              Create New Voice
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Create New Voice Clone</DialogTitle>
              <DialogDescription>
                Add a new voice to your library for use in your content.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="new-voice-name">Voice Name</Label>
                  <Input 
                    id="new-voice-name" 
                    placeholder="e.g. Professional Male" 
                    value={voiceName}
                    onChange={(e) => setVoiceName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="avatar-assignment">Assign to Avatar (Optional)</Label>
                  <select 
                    id="avatar-assignment" 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={selectedAvatarId}
                    onChange={(e) => setSelectedAvatarId(e.target.value)}
                  >
                    <option value="">Select an avatar</option>
                    {isLoadingAvatars ? (
                      <option disabled>Loading avatars...</option>
                    ) : (
                      avatars.map((avatar) => (
                        <option key={avatar.id} value={avatar.id}>
                          {avatar.name} ({avatar.gender})
                        </option>
                      ))
                    )}
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-voice-sample">Sample Text</Label>
                <Textarea 
                  id="new-voice-sample" 
                  placeholder="Enter text that will be used to generate the voice" 
                  value={sampleText}
                  onChange={(e) => setSampleText(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setVoiceName('')}>
                Cancel
              </Button>
              <Button onClick={handleGenerateVoice} disabled={isGenerating}>
                {isGenerating ? (
                  <>
                    <RefreshCcw className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Wand2 className="mr-2 h-4 w-4" />
                    Generate Voice
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="library">Voice Library</TabsTrigger>
          <TabsTrigger value="create">Voice Creator</TabsTrigger>
          <TabsTrigger value="analysis">Voice Analysis</TabsTrigger>
        </TabsList>
        
        <TabsContent value="library" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {isLoadingVoiceOvers ? (
              <div className="col-span-3 flex justify-center py-12">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="ml-3 text-muted-foreground">Loading voice overs...</p>
              </div>
            ) : voiceOvers.length === 0 ? (
              <div className="col-span-3 text-center py-12">
                <p className="text-muted-foreground">No voice overs found. Create your first voice!</p>
              </div>
            ) : (
              voiceOvers.map((voice) => {
                const avatar = voice.avatar || avatars.find(a => a.id === voice.avatarId)
                
                return (
                  <Card key={voice.id} className={selectedVoiceId === voice.id ? 'ring-2 ring-primary' : ''}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {avatar && (
                            <div className="h-10 w-10 rounded-full overflow-hidden">
                              <img
                                src={avatar.imageUrl}
                                alt={avatar.name}
                                className="h-full w-full object-cover"
                              />
                            </div>
                          )}
                          <div>
                            <CardTitle className="text-base">{voice.name}</CardTitle>
                            <CardDescription>{avatar?.name || "Unassigned"}</CardDescription>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8"
                            onClick={() => setSelectedVoiceId(voice.id === selectedVoiceId ? '' : voice.id)}
                          >
                            <PlayIcon className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-col gap-2">
                        <div className="text-sm text-muted-foreground">
                          <span className="font-medium text-foreground">Sample: </span>
                          "{voice.transcript}"
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Duration: {voice.duration}s</span>
                          <span className="text-muted-foreground">
                            Created: {voice.createdAt ? 
                              new Date(voice.createdAt).toLocaleDateString() : 
                              'Recently'}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between pt-0">
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Export
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={handleAnalyzeVoice} 
                        disabled={isAnalyzing || selectedVoiceId !== voice.id}
                      >
                        {isAnalyzing && selectedVoiceId === voice.id ? (
                          <RefreshCcw className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <BarChart className="h-4 w-4 mr-2" />
                        )}
                        Analyze
                      </Button>
                    </CardFooter>
                  </Card>
                )
              })
            )}
            
            <Card className="flex h-[166px] items-center justify-center">
              <CardContent className="flex flex-col items-center">
                <div className="rounded-full border-2 border-dashed border-muted-foreground/25 p-6">
                  <PlusIcon className="h-6 w-6 text-muted-foreground/70" />
                </div>
                <p className="mt-4 text-muted-foreground">Add New Voice</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="create" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Voice Cloning</CardTitle>
                <CardDescription>
                  Create a new AI voice by uploading samples or cloning from text
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="voice-name">Voice Name</Label>
                  <Input 
                    id="voice-name" 
                    placeholder="e.g. Professional Female" 
                    value={voiceName}
                    onChange={(e) => setVoiceName(e.target.value)}
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="voice-description">Description</Label>
                  <Input 
                    id="voice-description" 
                    placeholder="e.g. Clear and confident corporate voice" 
                    value={voiceDescription}
                    onChange={(e) => setVoiceDescription(e.target.value)}
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label>Voice Source</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" className="justify-start">
                      <MicIcon className="mr-2 h-4 w-4" />
                      Upload Sample
                    </Button>
                    <Button variant="outline" className="justify-start" disabled>
                      <FileAudio className="mr-2 h-4 w-4" />
                      Use Existing
                    </Button>
                  </div>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="avatar-assignment">Assign to Avatar (Optional)</Label>
                  <select 
                    id="avatar-assignment" 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={selectedAvatarId}
                    onChange={(e) => setSelectedAvatarId(e.target.value)}
                  >
                    <option value="">Select an avatar</option>
                    {isLoadingAvatars ? (
                      <option disabled>Loading avatars...</option>
                    ) : (
                      avatars.map((avatar) => (
                        <option key={avatar.id} value={avatar.id}>
                          {avatar.name} ({avatar.gender})
                        </option>
                      ))
                    )}
                  </select>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="sample-text">Sample Text</Label>
                  <Textarea 
                    id="sample-text" 
                    placeholder="Enter text to generate a voice sample"
                    value={sampleText}
                    onChange={(e) => setSampleText(e.target.value)}
                    rows={4}
                  />
                </div>
                
                <Button className="w-full" onClick={handleGenerateVoice} disabled={isGenerating}>
                  {isGenerating ? (
                    <>
                      <RefreshCcw className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Wand2 className="mr-2 h-4 w-4" />
                      Generate Voice
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Voice Settings</CardTitle>
                <CardDescription>
                  Customize the characteristics of your AI voice
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="pitch">Pitch</Label>
                    <span className="text-muted-foreground text-sm">
                      {getSettingLabel('pitch', voiceSettings.pitch)}
                    </span>
                  </div>
                  <Slider
                    id="pitch"
                    value={[voiceSettings.pitch]}
                    onValueChange={(value) => handleSettingChange('pitch', value)}
                    max={100}
                    step={1}
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="speed">Speed</Label>
                    <span className="text-muted-foreground text-sm">
                      {getSettingLabel('speed', voiceSettings.speed)}
                    </span>
                  </div>
                  <Slider
                    id="speed"
                    value={[voiceSettings.speed]}
                    onValueChange={(value) => handleSettingChange('speed', value)}
                    max={100}
                    step={1}
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="clarity">Clarity</Label>
                    <span className="text-muted-foreground text-sm">
                      {getSettingLabel('clarity', voiceSettings.clarity)}
                    </span>
                  </div>
                  <Slider
                    id="clarity"
                    value={[voiceSettings.clarity]}
                    onValueChange={(value) => handleSettingChange('clarity', value)}
                    max={100}
                    step={1}
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="emotion">Emotional Tone</Label>
                    <span className="text-muted-foreground text-sm">
                      {getSettingLabel('emotion', voiceSettings.emotion)}
                    </span>
                  </div>
                  <Slider
                    id="emotion"
                    value={[voiceSettings.emotion]}
                    onValueChange={(value) => handleSettingChange('emotion', value)}
                    max={100}
                    step={1}
                  />
                </div>
                
                <div className="flex gap-2 pt-4">
                  <Button variant="outline" className="w-full">
                    <Volume2 className="mr-2 h-4 w-4" />
                    Preview
                  </Button>
                  <Button variant="default" className="w-full" onClick={handleGenerateVoice} disabled={isGenerating}>
                    <SaveIcon className="mr-2 h-4 w-4" />
                    Save Voice
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="analysis" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Voice Performance Analysis</CardTitle>
              <CardDescription>
                Analytics and insights for your voice content
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedVoiceId ? (
                <div className="space-y-6">
                  {analysisResults ? (
                    <div className="space-y-8">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="space-y-2 text-center p-4 border rounded-lg">
                          <h3 className="text-sm font-medium text-muted-foreground">Clarity</h3>
                          <div className="text-3xl font-bold">{analysisResults.clarity}%</div>
                        </div>
                        <div className="space-y-2 text-center p-4 border rounded-lg">
                          <h3 className="text-sm font-medium text-muted-foreground">Emotion</h3>
                          <div className="text-3xl font-bold">{analysisResults.emotion}%</div>
                        </div>
                        <div className="space-y-2 text-center p-4 border rounded-lg">
                          <h3 className="text-sm font-medium text-muted-foreground">Pace</h3>
                          <div className="text-3xl font-bold">{analysisResults.pace}%</div>
                        </div>
                        <div className="space-y-2 text-center p-4 border rounded-lg">
                          <h3 className="text-sm font-medium text-muted-foreground">Engagement</h3>
                          <div className="text-3xl font-bold">{analysisResults.engagement}%</div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <h3 className="text-lg font-medium">Recommendations</h3>
                        <ul className="space-y-2">
                          {analysisResults.recommendations.map((rec, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm">
                              <div className="rounded-full bg-primary/10 p-1 mt-0.5">
                                <Wand2 className="h-3 w-3 text-primary" />
                              </div>
                              {rec}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <Button 
                        onClick={handleAnalyzeVoice}
                        disabled={isAnalyzing || !selectedVoiceId}
                      >
                        {isAnalyzing ? (
                          <>
                            <RefreshCcw className="mr-2 h-4 w-4 animate-spin" />
                            Analyzing...
                          </>
                        ) : (
                          <>
                            <BarChart className="mr-2 h-4 w-4" />
                            Analyze Selected Voice
                          </>
                        )}
                      </Button>
                      <p className="text-sm text-muted-foreground mt-2">
                        Select a voice from the library and click analyze to get detailed insights.
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <div className="rounded-full bg-muted p-6">
                    <Wand2 className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <h3 className="mt-4 text-lg font-medium">Select a Voice to Analyze</h3>
                  <p className="mt-2 text-sm text-muted-foreground max-w-md">
                    Go to the Voice Library tab and select a voice to analyze its performance metrics 
                    and receive detailed feedback on tone, pacing, and delivery.
                  </p>
                  <Button className="mt-4" variant="outline" onClick={() => setActiveTab('library')}>
                    Go to Voice Library
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Dialog open={showAnalysisDialog} onOpenChange={setShowAnalysisDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Voice Analysis Results</DialogTitle>
                <DialogDescription>
                  Detailed analysis of your voice performance
                </DialogDescription>
              </DialogHeader>
              {analysisResults && (
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1 p-3 border rounded-md">
                      <div className="text-sm text-muted-foreground">Clarity</div>
                      <div className="text-xl font-semibold">{analysisResults.clarity}%</div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="bg-primary h-full" 
                          style={{ width: `${analysisResults.clarity}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="space-y-1 p-3 border rounded-md">
                      <div className="text-sm text-muted-foreground">Emotion</div>
                      <div className="text-xl font-semibold">{analysisResults.emotion}%</div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="bg-primary h-full" 
                          style={{ width: `${analysisResults.emotion}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="space-y-1 p-3 border rounded-md">
                      <div className="text-sm text-muted-foreground">Pace</div>
                      <div className="text-xl font-semibold">{analysisResults.pace}%</div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="bg-primary h-full" 
                          style={{ width: `${analysisResults.pace}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="space-y-1 p-3 border rounded-md">
                      <div className="text-sm text-muted-foreground">Engagement</div>
                      <div className="text-xl font-semibold">{analysisResults.engagement}%</div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="bg-primary h-full" 
                          style={{ width: `${analysisResults.engagement}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="font-medium">Recommendations</h3>
                    <ul className="space-y-2">
                      {analysisResults.recommendations.map((rec, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <div className="rounded-full bg-primary/10 p-1 mt-0.5">
                            <Wand2 className="h-3 w-3 text-primary" />
                          </div>
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowAnalysisDialog(false)}>
                  Close
                </Button>
                <Button>
                  <Download className="mr-2 h-4 w-4" />
                  Export Report
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>
      </Tabs>
    </div>
  )
}