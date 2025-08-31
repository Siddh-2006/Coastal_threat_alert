import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Mail, Lock, Eye, EyeOff, Activity } from 'lucide-react';
import heroImage from '@/assets/hero-sustainable-future.jpg';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      // Use FormData for x-www-form-urlencoded
      const data = new URLSearchParams();
      data.append('email', formData.email);
      data.append('password', formData.password);
      // Connect to backend
      const response = await fetch('/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: data.toString(),
        credentials: 'include'
      });
      if (response.ok) {
        const result = await response.json();
        // Optionally store token/user info here
        alert('Login successful!');
        // Redirect or update UI as needed
      } else {
        const err = await response.json();
        setError(err.message || 'Login failed. Please check your credentials.');
      }
    } catch (error) {
      setError('Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-16 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 hero-gradient opacity-10" />
      <div className="absolute inset-0">
        <img 
          src={heroImage} 
          alt="Environmental background" 
          className="w-full h-full object-cover opacity-20"
        />
      </div>
      
      {/* Content */}
      <div className="relative min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <Card className="card-oceanic backdrop-blur-sm bg-card/95">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 hero-gradient rounded-full flex items-center justify-center animate-pulse-glow">
                  <Shield className="w-8 h-8 text-white" />
                </div>
              </div>
              <CardTitle className="text-3xl font-bold text-gradient">
                Welcome Back
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Sign in to your ClimaGuard account
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      className="pl-10 transition-all duration-300 focus:ring-2 focus:ring-primary-glow/50"
                      placeholder="Enter your email"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      required
                      value={formData.password}
                      onChange={handleInputChange}
                      className="pl-10 pr-10 transition-all duration-300 focus:ring-2 focus:ring-primary-glow/50"
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="h-4 w-4 text-primary focus:ring-primary-glow border-gray-300 rounded"
                      aria-label="Remember me"
                    />
                    <Label htmlFor="remember-me" className="ml-2 text-sm text-muted-foreground">
                      Remember me
                    </Label>
                  </div>

                  <div className="text-sm">
                    {/* <Link 
                      to="/forgot-password" 
                      className="font-medium text-primary hover:text-primary-glow transition-colors"
                    >
                      Forgot password?
                    </Link> */}
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="text-red-500 text-sm text-center">{error}</div>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  variant="hero"
                  size="lg"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                      Signing In...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <Activity className="w-4 h-4 mr-2" />
                      Sign In
                    </div>
                  )}
                </Button>

                {/* Divider */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                  </div>
                </div>

                {/* Social Login Buttons */}
                {/* <div className="grid grid-cols-2 gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      // Handle Google login
                      console.log('Google login');
                    }}
                  >
                    <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Google
                  </Button> */}
                  
                  {/* <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      // Handle GitHub login
                      console.log('GitHub login');
                    }}
                  >
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                    GitHub
                  </Button> */}
                {/* </div> */}

                {/* Register Link */}
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    Don't have an account?{' '}
                    <Link 
                      to="/register" 
                      className="font-medium text-primary hover:text-primary-glow transition-colors"
                    >
                      Create one here
                    </Link>
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Additional Info */}
          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              By signing in, you agree to our{' '}
              <Link to="/terms" className="underline hover:text-foreground transition-colors">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link to="/privacy" className="underline hover:text-foreground transition-colors">
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;