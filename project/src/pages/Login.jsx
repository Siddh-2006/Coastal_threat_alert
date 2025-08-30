import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Users, Fish, Building, Eye, EyeOff } from 'lucide-react';

const Login = ({ onLogin }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    userType: 'public',
    organization: '',
    location: ''
  });
  const navigate = useNavigate();

  const userTypes = [
    { id: 'authority', label: 'Government Authority', icon: Shield, color: 'blue' },
    { id: 'ngo', label: 'Environmental NGO', icon: Users, color: 'green' },
    { id: 'fisherfolk', label: 'Fishing Community', icon: Fish, color: 'orange' },
    { id: 'public', label: 'General Public', icon: Building, color: 'purple' },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (isSignUp) {
      // Sign up logic
      if (!formData.name || !formData.email || !formData.password) {
        alert('Please fill in all required fields');
        return;
      }
      
      const userData = {
        name: formData.name,
        email: formData.email,
        type: formData.userType,
        organization: formData.organization,
        location: formData.location,
        id: Date.now().toString()
      };
      
      onLogin(userData);
      navigate('/profile');
    } else {
      // Login logic
      if (!formData.email || !formData.password) {
        alert('Please enter email and password');
        return;
      }
      
      // Simulate login with demo user
      const userData = {
        name: 'Demo User',
        email: formData.email,
        type: 'public',
        organization: 'Independent',
        location: 'San Francisco, CA',
        id: 'demo123'
      };
      
      onLogin(userData);
      navigate('/');
    }
  };

  return (
    <div className="pt-20 pb-16 px-4">
      <div className="max-w-md mx-auto">
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 border border-white/20">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">
              {isSignUp ? 'Join ClimaGuard' : 'Welcome Back'}
            </h1>
            <p className="text-gray-200">
              {isSignUp 
                ? 'Create your account to start protecting coastal ecosystems'
                : 'Sign in to access your environmental dashboard'
              }
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div>
                <label className="block text-white text-sm font-medium mb-2">Full Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:border-blue-400 focus:outline-none"
                  placeholder="Enter your full name"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-white text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:border-blue-400 focus:outline-none"
                placeholder="Enter your email"
                required
              />
            </div>

            <div>
              <label className="block text-white text-sm font-medium mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:border-blue-400 focus:outline-none pr-12"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {isSignUp && (
              <>
                <div>
                  <label className="block text-white text-sm font-medium mb-2">User Type</label>
                  <div className="grid grid-cols-2 gap-2">
                    {userTypes.map((type) => (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, userType: type.id })}
                        className={`flex items-center space-x-2 p-3 rounded-lg text-sm transition-all duration-300 ${
                          formData.userType === type.id
                            ? `bg-${type.color}-500/30 text-${type.color}-300 border border-${type.color}-400`
                            : 'bg-white/10 text-gray-300 border border-transparent hover:bg-white/20'
                        }`}
                      >
                        <type.icon className="w-4 h-4" />
                        <span className="text-xs">{type.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-white text-sm font-medium mb-2">Organization (Optional)</label>
                  <input
                    type="text"
                    value={formData.organization}
                    onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:border-blue-400 focus:outline-none"
                    placeholder="Organization or agency"
                  />
                </div>

                <div>
                  <label className="block text-white text-sm font-medium mb-2">Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:border-blue-400 focus:outline-none"
                    placeholder="City, State/Region"
                  />
                </div>
              </>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              {isSignUp ? 'Create Account' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-blue-400 hover:text-blue-300 transition-colors duration-300"
            >
              {isSignUp 
                ? 'Already have an account? Sign in'
                : "Don't have an account? Sign up"
              }
            </button>
          </div>

          {!isSignUp && (
            <div className="mt-4 text-center">
              <p className="text-gray-400 text-sm">
                Demo credentials: any email and password will work
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;