import { useState } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import { Button } from '../components/ui/button'
import { Switch } from '../components/ui/switch'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'

export default function Settings() {
  const [apiKeys, setApiKeys] = useState({
    elaiApiKey: '',
    tavusApiKey: '',
    openaiApiKey: '',
    ltxStudioApiKey: '',
    openaiOrganization: ''
  })

  const [apiConfig, setApiConfig] = useState({
    preferredAvatarQuality: 'high',
    videoResolution: '1080p',
    defaultVoiceStyle: 'natural',
    aiGenerationTimeout: 180,
    maxSceneLength: 60,
    maxProjectDuration: 3600
  })

  const handleSaveApiKey = (keyName: string, value: string) => {
    setApiKeys({
      ...apiKeys,
      [keyName]: value,
    })
  }

  const handleSaveApiConfig = (keyName: string, value: string) => {
    setApiConfig({
      ...apiConfig,
      [keyName]: value,
    })
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your account and application preferences
        </p>
      </div>

      <Tabs defaultValue="account" className="space-y-4">
        <TabsList>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>
        
        <TabsContent value="account" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your account information and profile settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" placeholder="Your name" defaultValue="Alexandra Chen" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" placeholder="Your email" defaultValue="alex.chen@example.com" />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="company">Company</Label>
                <Input id="company" placeholder="Your company" defaultValue="Innovative Learning Solutions" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="jobtitle">Job Title</Label>
                <Input id="jobtitle" placeholder="Your job title" defaultValue="Content Creation Manager" />
              </div>
            </CardContent>
            <CardFooter>
              <Button>Save Changes</Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Password</CardTitle>
              <CardDescription>
                Update your password to keep your account secure
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Current Password</Label>
                <Input id="current-password" type="password" />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input id="new-password" type="password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <Input id="confirm-password" type="password" />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button>Update Password</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="appearance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>
                Customize the look and feel of the application
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Dark Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable dark mode for the application interface
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              
              <div className="space-y-2">
                <Label>Theme</Label>
                <Select defaultValue="system">
                  <SelectTrigger>
                    <SelectValue placeholder="Select theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="system">System Default</SelectItem>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Font Size</Label>
                <Select defaultValue="medium">
                  <SelectTrigger>
                    <SelectValue placeholder="Select font size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">Small</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="large">Large</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <CardFooter>
              <Button>Save Preferences</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="integrations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>API Integrations</CardTitle>
              <CardDescription>
                Connect to various content creation and AI services
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Elai.io</h4>
                    <p className="text-sm text-muted-foreground">
                      AI video generation platform
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      apiKeys.elaiApiKey ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' : 'bg-amber-100 text-amber-800 dark:bg-amber-800 dark:text-amber-100'
                    }`}>
                      {apiKeys.elaiApiKey ? 'Connected' : 'Not Connected'}
                    </span>
                  </div>
                </div>
                <div className="flex gap-4">
                  <Input 
                    placeholder="Enter Elai API Key"
                    type="password"
                    value={apiKeys.elaiApiKey}
                    onChange={(e) => handleSaveApiKey('elaiApiKey', e.target.value)}
                  />
                  <Button onClick={() => handleSaveApiKey('elaiApiKey', apiKeys.elaiApiKey)}>
                    {apiKeys.elaiApiKey ? 'Update' : 'Connect'}
                  </Button>
                </div>
                {apiKeys.elaiApiKey && (
                  <div className="ml-4 pl-4 border-l-2 border-muted mt-2 text-sm text-muted-foreground">
                    <div className="mb-1">Features: AI video generation, avatar customization, scene creation</div>
                    <div className="flex items-center gap-1">
                      <span className="font-semibold">Status:</span>
                      <span className="text-green-600 dark:text-green-400">Active</span>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Tavus</h4>
                    <p className="text-sm text-muted-foreground">
                      AI-powered video and voice cloning
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      apiKeys.tavusApiKey ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' : 'bg-amber-100 text-amber-800 dark:bg-amber-800 dark:text-amber-100'
                    }`}>
                      {apiKeys.tavusApiKey ? 'Connected' : 'Not Connected'}
                    </span>
                  </div>
                </div>
                <div className="flex gap-4">
                  <Input 
                    placeholder="Enter Tavus API Key"
                    type="password"
                    value={apiKeys.tavusApiKey}
                    onChange={(e) => handleSaveApiKey('tavusApiKey', e.target.value)}
                  />
                  <Button onClick={() => handleSaveApiKey('tavusApiKey', apiKeys.tavusApiKey)}>
                    {apiKeys.tavusApiKey ? 'Update' : 'Connect'}
                  </Button>
                </div>
                {apiKeys.tavusApiKey && (
                  <div className="ml-4 pl-4 border-l-2 border-muted mt-2 text-sm text-muted-foreground">
                    <div className="mb-1">Features: Voice cloning, realistic voice synthesis, audio analysis</div>
                    <div className="flex items-center gap-1">
                      <span className="font-semibold">Status:</span>
                      <span className="text-green-600 dark:text-green-400">Active</span>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">OpenAI</h4>
                    <p className="text-sm text-muted-foreground">
                      AI content generation and script writing
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      apiKeys.openaiApiKey ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' : 'bg-amber-100 text-amber-800 dark:bg-amber-800 dark:text-amber-100'
                    }`}>
                      {apiKeys.openaiApiKey ? 'Connected' : 'Not Connected'}
                    </span>
                  </div>
                </div>
                <div className="flex gap-4">
                  <Input 
                    placeholder="Enter OpenAI API Key" 
                    type="password"
                    value={apiKeys.openaiApiKey}
                    onChange={(e) => handleSaveApiKey('openaiApiKey', e.target.value)}
                  />
                  <Button onClick={() => handleSaveApiKey('openaiApiKey', apiKeys.openaiApiKey)}>
                    {apiKeys.openaiApiKey ? 'Update' : 'Connect'}
                  </Button>
                </div>
                {apiKeys.openaiApiKey && (
                  <>
                    <div className="flex gap-4">
                      <Input 
                        placeholder="OpenAI Organization ID (optional)" 
                        value={apiKeys.openaiOrganization}
                        onChange={(e) => handleSaveApiKey('openaiOrganization', e.target.value)}
                      />
                    </div>
                    <div className="ml-4 pl-4 border-l-2 border-muted mt-2 text-sm text-muted-foreground">
                      <div className="mb-1">Features: Script generation, content ideas, interaction creation</div>
                      <div className="flex items-center gap-1">
                        <span className="font-semibold">Status:</span>
                        <span className="text-green-600 dark:text-green-400">Active</span>
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">LTX Studio</h4>
                    <p className="text-sm text-muted-foreground">
                      Advanced storyboarding and scenario creation
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      apiKeys.ltxStudioApiKey ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' : 'bg-amber-100 text-amber-800 dark:bg-amber-800 dark:text-amber-100'
                    }`}>
                      {apiKeys.ltxStudioApiKey ? 'Connected' : 'Not Connected'}
                    </span>
                  </div>
                </div>
                <div className="flex gap-4">
                  <Input 
                    placeholder="Enter LTX Studio API Key" 
                    type="password"
                    value={apiKeys.ltxStudioApiKey}
                    onChange={(e) => handleSaveApiKey('ltxStudioApiKey', e.target.value)}
                  />
                  <Button onClick={() => handleSaveApiKey('ltxStudioApiKey', apiKeys.ltxStudioApiKey)}>
                    {apiKeys.ltxStudioApiKey ? 'Update' : 'Connect'}
                  </Button>
                </div>
                {apiKeys.ltxStudioApiKey && (
                  <div className="ml-4 pl-4 border-l-2 border-muted mt-2 text-sm text-muted-foreground">
                    <div className="mb-1">Features: Visual storyboarding, scenario planning, visual asset creation</div>
                    <div className="flex items-center gap-1">
                      <span className="font-semibold">Status:</span>
                      <span className="text-green-600 dark:text-green-400">Active</span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Advanced Configuration</CardTitle>
              <CardDescription>
                Fine-tune AI service behavior and generation parameters
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="avatar-quality">Avatar Quality</Label>
                  <Select 
                    value={apiConfig.preferredAvatarQuality}
                    onValueChange={(value) => handleSaveApiConfig('preferredAvatarQuality', value)}
                  >
                    <SelectTrigger id="avatar-quality">
                      <SelectValue placeholder="Select quality" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft (Faster Generation)</SelectItem>
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="high">High (Best Quality)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">
                    Higher quality improves visual fidelity but increases generation time
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="video-resolution">Video Resolution</Label>
                  <Select 
                    value={apiConfig.videoResolution}
                    onValueChange={(value) => handleSaveApiConfig('videoResolution', value)}
                  >
                    <SelectTrigger id="video-resolution">
                      <SelectValue placeholder="Select resolution" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="720p">720p (HD)</SelectItem>
                      <SelectItem value="1080p">1080p (Full HD)</SelectItem>
                      <SelectItem value="2k">2K</SelectItem>
                      <SelectItem value="4k">4K (Ultra HD)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">
                    Higher resolution increases file size and generation time
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="voice-style">Default Voice Style</Label>
                  <Select 
                    value={apiConfig.defaultVoiceStyle}
                    onValueChange={(value) => handleSaveApiConfig('defaultVoiceStyle', value)}
                  >
                    <SelectTrigger id="voice-style">
                      <SelectValue placeholder="Select style" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="natural">Natural</SelectItem>
                      <SelectItem value="conversational">Conversational</SelectItem>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="dramatic">Dramatic</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">
                    Default style used for newly generated voices
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ai-timeout">AI Generation Timeout (seconds)</Label>
                  <Input 
                    id="ai-timeout" 
                    type="number" 
                    min="30"
                    max="600"
                    value={apiConfig.aiGenerationTimeout}
                    onChange={(e) => handleSaveApiConfig('aiGenerationTimeout', parseInt(e.target.value) || 180)}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Maximum time to wait for AI generation before timing out
                  </p>
                </div>
              </div>

              <div className="pt-4">
                <Button>Save Configuration</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}