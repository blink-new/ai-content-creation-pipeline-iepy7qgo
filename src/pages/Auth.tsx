import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Film } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { toast } from 'sonner';

export default function Auth() {
  const navigate = useNavigate();
  const { signIn, signUp, user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  
  // Login form state
  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
  });
  
  // Signup form state
  const [signupData, setSignupData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });
  
  // Check if user is already logged in and redirect
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);
  
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const { error } = await signIn(loginData.email, loginData.password);
      
      if (error) {
        toast.error(error.message);
      } else {
        toast.success('Logged in successfully!');
        navigate('/');
      }
    } catch (err) {
      toast.error('An error occurred during sign in');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Validate passwords match
    if (signupData.password !== signupData.confirmPassword) {
      toast.error('Passwords do not match');
      setIsLoading(false);
      return;
    }
    
    try {
      const { error } = await signUp(signupData.email, signupData.password);
      
      if (error) {
        toast.error(error.message);
      } else {
        toast.success('Account created! You can now log in.');
        // Auto switch to login tab
        document.getElementById('login-tab')?.click();
      }
    } catch (err) {
      toast.error('An error occurred during sign up');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // If user is already logged in, don't render the form
  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-animaker-gray-100 px-4">
      {/* Animated background elements */}
      <div className="animaker-blob animaker-blob-1"></div>
      <div className="animaker-blob animaker-blob-2"></div>
      <div className="absolute top-20 right-10 w-40 h-40 animaker-dot-pattern rounded-full opacity-20 -z-10"></div>
      <div className="absolute bottom-10 left-40 w-60 h-60 animaker-dot-pattern rounded-full opacity-20 -z-10"></div>
      
      {/* Card container with animation */}
      <div className="w-full max-w-md bg-white rounded-animaker-lg shadow-animaker-card p-8 relative z-10 animate-fade-in">
        {/* Header/Logo */}
        <div className="text-center mb-8 flex flex-col items-center">
          <div className="inline-flex mb-3 rounded-full bg-primary/10 p-3">
            <Film className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-heading font-semibold animaker-gradient-text">ContentAI</h1>
          <p className="text-animaker-text-light mt-2">Your AI-powered content creation platform</p>
        </div>
        
        {/* Tabs for Login/Signup */}
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="login" id="login-tab">Login</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>
          
          {/* Login Form */}
          <TabsContent value="login" className="mt-0">
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-animaker-text">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={loginData.email}
                  onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                  required
                  className="w-full"
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="text-sm font-medium text-animaker-text">
                    Password
                  </label>
                  <a href="#" className="text-xs text-primary hover:underline">
                    Forgot password?
                  </a>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  required
                  className="w-full"
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full animaker-button mt-6" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="animate-spin h-4 w-4 mr-2 border-t-2 border-b-2 border-white rounded-full"></span>
                    Logging in...
                  </>
                ) : 'Login'}
              </Button>
            </form>
          </TabsContent>
          
          {/* Signup Form */}
          <TabsContent value="signup" className="mt-0">
            <form onSubmit={handleSignupSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="signup-email" className="text-sm font-medium text-animaker-text">
                  Email
                </label>
                <Input
                  id="signup-email"
                  type="email"
                  placeholder="you@example.com"
                  value={signupData.email}
                  onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                  required
                  className="w-full"
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="signup-password" className="text-sm font-medium text-animaker-text">
                  Password
                </label>
                <Input
                  id="signup-password"
                  type="password"
                  placeholder="••••••••"
                  value={signupData.password}
                  onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                  required
                  className="w-full"
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="confirm-password" className="text-sm font-medium text-animaker-text">
                  Confirm Password
                </label>
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="••••••••"
                  value={signupData.confirmPassword}
                  onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })}
                  required
                  className="w-full"
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full animaker-button mt-6" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="animate-spin h-4 w-4 mr-2 border-t-2 border-b-2 border-white rounded-full"></span>
                    Creating account...
                  </>
                ) : 'Create Account'}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
        
        {/* Footer */}
        <div className="mt-8 text-center text-xs text-animaker-text-light">
          <p>By using ContentAI, you agree to our Terms of Service and Privacy Policy.</p>
        </div>
      </div>
    </div>
  );
}