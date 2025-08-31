import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shield, User, Mail, Lock, MapPin, Users, Building, AlertTriangle, Zap, Eye, EyeOff } from 'lucide-react';
import heroImage from '@/assets/hero-sustainable-future.jpg';
import axios from 'axios';
//  

const Register = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    userType: '',
    location: ''
  });
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentLocation, setCurrentLocation] = useState('');
  const [locationLoading, setLocationLoading] = useState(false);

  const userTypes = [
    { value: 'normal_user', label: 'Normal User', icon: User },
    { value: 'ngo', label: 'NGO', icon: Users },
    { value: 'government', label: 'Government', icon: Building },
    { value: 'disaster_management', label: 'Disaster Management', icon: AlertTriangle },
    { value: 'defence_team', label: 'Defence Team', icon: Shield }
  ];

  // Get current location
  const getCurrentLocation = () => {
    setLocationLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            // Using a reverse geocoding service (you can replace with your preferred service)
            const response = await fetch(
              `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=YOUR_API_KEY`
            );
            
            if (response.ok) {
              const data = await response.json();
              const location = data.results[0]?.formatted || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
              setCurrentLocation(location);
              setFormData(prev => ({ ...prev, location }));
            } else {
              // Fallback to coordinates
              const location = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
              setCurrentLocation(location);
              setFormData(prev => ({ ...prev, location }));
            }
          } catch (error) {
            console.error('Error getting location name:', error);
            const location = `${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`;
            setCurrentLocation(location);
            setFormData(prev => ({ ...prev, location }));
          } finally {
            setLocationLoading(false);
          }
        },
        (error) => {
          console.error('Error getting location:', error);
          setLocationLoading(false);
          // You might want to show an error message here
        }
      );
    } else {
      setLocationLoading(false);
      console.error('Geolocation is not supported by this browser.');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: string) => {
    setFormData(prev => ({ ...prev, userType: value }));
  };

  // Handle photo change
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setProfilePhoto(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setPhotoPreview(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    setIsLoading(true);
    
    try {
      // Use FormData for multipart/form-data
      const data = new FormData();
      data.append('fullName', formData.fullName);
      data.append('email', formData.email);
      data.append('password', formData.password);
      data.append('userType', formData.userType);
      data.append('location', formData.location);
      if (profilePhoto) data.append('profilePhoto', profilePhoto);
      
      // Connect to backend
      const response = await axios.post('http://localhost:3000/users/register', data);

      if (response.status === 200) {
        alert('Registration successful!');
        // Optionally redirect or clear form
      } else {
        alert('Registration failed: ' + (response.data.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Registration error:', error);
      alert('Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const selectedUserType = userTypes.find(type => type.value === formData.userType);

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
                Join ClimaGuard
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Create your account to start protecting coastal communities
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6" encType="multipart/form-data">
                {/* Full Name */}
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-sm font-medium">
                    Full Name
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="fullName"
                      name="fullName"
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className="pl-10 transition-all duration-300 focus:ring-2 focus:ring-primary-glow/50"
                      placeholder="Enter your full name"
                    />
                  </div>
                </div>

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
                      placeholder="Create a password"
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

                {/* Confirm Password */}
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium">
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="pl-10 pr-10 transition-all duration-300 focus:ring-2 focus:ring-primary-glow/50"
                      placeholder="Confirm your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* User Type */}
                <div className="space-y-2">
                  <Label htmlFor="userType" className="text-sm font-medium">
                    Who Are You?
                  </Label>
                  <Select onValueChange={handleSelectChange} required>
                    <SelectTrigger className="transition-all duration-300 focus:ring-2 focus:ring-primary-glow/50">
                      <div className="flex items-center">
                        {selectedUserType && (
                          <selectedUserType.icon className="w-4 h-4 mr-2 text-muted-foreground" />
                        )}
                        <SelectValue placeholder="Select your role" />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      {userTypes.map((type) => {
                        const Icon = type.icon;
                        return (
                          <SelectItem key={type.value} value={type.value}>
                            <div className="flex items-center">
                              <Icon className="w-4 h-4 mr-2" />
                              {type.label}
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>

                {/* Location */}
                <div className="space-y-2">
                  <Label htmlFor="location" className="text-sm font-medium">
                    Location
                  </Label>
                  <div className="flex space-x-2">
                    <div className="relative flex-1">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="location"
                        name="location"
                        type="text"
                        required
                        value={formData.location}
                        onChange={handleInputChange}
                        className="pl-10 transition-all duration-300 focus:ring-2 focus:ring-primary-glow/50"
                        placeholder="Enter your location"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={getCurrentLocation}
                      disabled={locationLoading}
                      className="shrink-0"
                    >
                      {locationLoading ? (
                        <div className="w-4 h-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                      ) : (
                        <Zap className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Click the lightning icon to use your current location
                  </p>
                </div>

                {/* Profile Photo Upload */}
                <div className="space-y-2">
                  <Label htmlFor="profilePhoto" className="text-sm font-medium">
                    Profile Photo
                  </Label>
                  <div className="flex items-center space-x-4">
                    <input
                      id="profilePhoto"
                      name="profilePhoto"
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                      placeholder="Upload your profile photo"
                      title="Upload your profile photo"
                    />
                    {photoPreview && (
                      <img
                        src={photoPreview}
                        alt="Preview"
                        className="w-12 h-12 rounded-full object-cover border"
                      />
                    )}
                  </div>
                </div>

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
                      Creating Account...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <Shield className="w-4 h-4 mr-2" />
                      Create Account
                    </div>
                  )}
                </Button>

                {/* Login Link */}
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    Already have an account?{' '}
                    <Link 
                      to="/login" 
                      className="font-medium text-primary hover:text-primary-glow transition-colors"
                    >
                      Sign in here
                    </Link>
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Register;

