import React, { useState } from 'react';
import { User, MapPin, Bell, Settings, Shield, Users, Fish, Building, Edit, Save, X } from 'lucide-react';

const Profile = ({ user }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState(user || {});
  const [notifications, setNotifications] = useState({
    stormSurge: true,
    pollution: true,
    algalBlooms: false,
    marineThreats: true,
    soilErosion: false,
  });

  const userTypes = [
    { id: 'authority', label: 'Government Authority', icon: Shield, color: 'blue' },
    { id: 'ngo', label: 'Environmental NGO', icon: Users, color: 'green' },
    { id: 'fisherfolk', label: 'Fishing Community', icon: Fish, color: 'orange' },
    { id: 'public', label: 'General Public', icon: Building, color: 'purple' },
  ];

  const recentAlerts = [
    {
      id: 1,
      type: 'Storm Surge',
      message: 'High wave activity detected in your region',
      timestamp: new Date(Date.now() - 1000 * 60 * 15),
      severity: 'high'
    },
    {
      id: 2,
      type: 'Water Quality',
      message: 'Decreased oxygen levels in nearby waters',
      timestamp: new Date(Date.now() - 1000 * 60 * 45),
      severity: 'medium'
    },
    {
      id: 3,
      type: 'Pollution',
      message: 'Air quality improvement in coastal areas',
      timestamp: new Date(Date.now() - 1000 * 60 * 120),
      severity: 'low'
    },
  ];

  const handleSaveProfile = () => {
    // In a real app, this would save to a backend
    setIsEditing(false);
    localStorage.setItem('climaguard_user', JSON.stringify(editedProfile));
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return 'text-red-400 bg-red-500/20';
      case 'medium': return 'text-yellow-400 bg-yellow-500/20';
      case 'low': return 'text-green-400 bg-green-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (minutes < 60) return `${minutes} min ago`;
    if (hours < 24) return `${hours} hr ago`;
    return `${Math.floor(hours / 24)} days ago`;
  };

  if (!user) {
    return (
      <div className="pt-20 pb-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-12">
            <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-4">Access Your Profile</h2>
            <p className="text-gray-200 mb-8">
              Please log in to access your personalized dashboard and manage your ClimaGuard settings.
            </p>
            <button className="px-8 py-3 bg-blue-500/20 text-blue-300 rounded-lg hover:bg-blue-500/30 transition-colors duration-300">
              Login to ClimaGuard
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentUserType = userTypes.find(type => type.id === user.type) || userTypes[3];

  return (
    <div className="pt-20 pb-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile Information */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Profile Information</h2>
                <button
                  onClick={() => isEditing ? handleSaveProfile() : setIsEditing(true)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors duration-300 ${
                    isEditing
                      ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                      : 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30'
                  }`}
                >
                  {isEditing ? <Save className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
                  <span>{isEditing ? 'Save' : 'Edit'}</span>
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-200 text-sm mb-2">Full Name</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedProfile.name || ''}
                        onChange={(e) => setEditedProfile({ ...editedProfile, name: e.target.value })}
                        className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:border-blue-400 focus:outline-none"
                      />
                    ) : (
                      <p className="text-white font-medium">{user.name}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-gray-200 text-sm mb-2">Email</label>
                    {isEditing ? (
                      <input
                        type="email"
                        value={editedProfile.email || ''}
                        onChange={(e) => setEditedProfile({ ...editedProfile, email: e.target.value })}
                        className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:border-blue-400 focus:outline-none"
                      />
                    ) : (
                      <p className="text-white font-medium">{user.email}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-gray-200 text-sm mb-2">Location</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedProfile.location || ''}
                        onChange={(e) => setEditedProfile({ ...editedProfile, location: e.target.value })}
                        className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:border-blue-400 focus:outline-none"
                        placeholder="City, State/Region"
                      />
                    ) : (
                      <p className="text-white font-medium">{user.location || 'Not specified'}</p>
                    )}
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-200 text-sm mb-2">User Type</label>
                    <div className={`flex items-center space-x-3 p-3 bg-${currentUserType.color}-500/20 rounded-lg border border-${currentUserType.color}-400/30`}>
                      <currentUserType.icon className={`w-6 h-6 text-${currentUserType.color}-400`} />
                      <span className="text-white font-medium">{currentUserType.label}</span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-gray-200 text-sm mb-2">Organization</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedProfile.organization || ''}
                        onChange={(e) => setEditedProfile({ ...editedProfile, organization: e.target.value })}
                        className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:border-blue-400 focus:outline-none"
                        placeholder="Organization or Agency"
                      />
                    ) : (
                      <p className="text-white font-medium">{user.organization || 'Independent'}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-gray-200 text-sm mb-2">Member Since</label>
                    <p className="text-white font-medium">January 2024</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Notification Settings */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6">
              <div className="flex items-center space-x-3 mb-6">
                <Bell className="w-6 h-6 text-blue-400" />
                <h2 className="text-2xl font-bold text-white">Notification Preferences</h2>
              </div>
              
              <div className="space-y-4">
                {Object.entries(notifications).map(([key, enabled]) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-gray-200 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                    </span>
                    <button
                      onClick={() => setNotifications({ ...notifications, [key]: !enabled })}
                      className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${
                        enabled ? 'bg-blue-500' : 'bg-gray-600'
                      }`}
                    >
                      <div
                        className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 ${
                          enabled ? 'transform translate-x-7' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Recent Alerts */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-4">Recent Alerts</h3>
              <div className="space-y-3">
                {recentAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-3 rounded-lg ${getSeverityColor(alert.severity)}`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium">{alert.type}</span>
                      <span className="text-xs opacity-75">{formatTimeAgo(alert.timestamp)}</span>
                    </div>
                    <p className="text-sm opacity-90">{alert.message}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full flex items-center space-x-3 p-3 bg-blue-500/20 text-blue-300 rounded-lg hover:bg-blue-500/30 transition-colors duration-300">
                  <MapPin className="w-5 h-5" />
                  <span>Update Location</span>
                </button>
                <button className="w-full flex items-center space-x-3 p-3 bg-green-500/20 text-green-300 rounded-lg hover:bg-green-500/30 transition-colors duration-300">
                  <Bell className="w-5 h-5" />
                  <span>Test Notifications</span>
                </button>
                <button className="w-full flex items-center space-x-3 p-3 bg-purple-500/20 text-purple-300 rounded-lg hover:bg-purple-500/30 transition-colors duration-300">
                  <Settings className="w-5 h-5" />
                  <span>Advanced Settings</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;