import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { User, MapPin, Bell, Settings, Shield, Users, Activity, Star } from 'lucide-react';

const Profile = () => {
  const [notifications, setNotifications] = useState({
    stormSurge: true,
    pollution: true,
    erosion: false,
    algalBlooms: true,
    general: false,
  });

  const userStats = [
    { label: 'Alerts Reported', value: '12', icon: Bell },
    { label: 'Community Score', value: '847', icon: Star },
    { label: 'Locations Monitored', value: '3', icon: MapPin },
    { label: 'Days Active', value: '156', icon: Activity },
  ];

  const recentActivity = [
    {
      type: 'alert',
      title: 'Reported pollution in Marina Bay',
      timestamp: '2 hours ago',
      status: 'verified'
    },
    {
      type: 'comment',
      title: 'Commented on storm surge warning',
      timestamp: '1 day ago',
      status: 'active'
    },
    {
      type: 'location',
      title: 'Added new monitoring location',
      timestamp: '3 days ago',
      status: 'active'
    },
  ];

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gradient mb-4">User Profile</h1>
          <p className="text-xl text-muted-foreground">Manage your environmental monitoring preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Information */}
          <div className="lg:col-span-1 space-y-6">
            {/* User Card */}
            <Card className="card-oceanic p-6">
              <div className="text-center mb-6">
                <div className="w-20 h-20 ocean-gradient rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gradient mb-2">Dr. Sarah Martinez</h3>
                <Badge variant="outline" className="bg-accent/10 text-accent border-accent/20 mb-2">
                  Environmental NGO
                </Badge>
                <p className="text-sm text-muted-foreground">Marine Conservation Alliance</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">San Francisco Bay Area</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Shield className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">Verified Environmental Expert</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">Member since March 2023</span>
                </div>
              </div>
            </Card>

            {/* Stats */}
            <Card className="card-oceanic p-6">
              <h4 className="font-semibold text-gradient mb-4">Activity Stats</h4>
              <div className="grid grid-cols-2 gap-4">
                {userStats.map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <div key={stat.label} className="text-center">
                      <Icon className="w-6 h-6 text-primary mx-auto mb-2" />
                      <div className="text-xl font-bold text-gradient">{stat.value}</div>
                      <div className="text-xs text-muted-foreground">{stat.label}</div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Settings */}
            <Card className="card-oceanic p-6">
              <h3 className="text-xl font-semibold text-gradient mb-6">Profile Settings</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Full Name</label>
                    <Input defaultValue="Dr. Sarah Martinez" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Email</label>
                    <Input defaultValue="sarah.martinez@marineca.org" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Organization</label>
                    <Input defaultValue="Marine Conservation Alliance" />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Location</label>
                    <Input defaultValue="San Francisco Bay Area" />
                  </div>
                  <div>
                    <label htmlFor="user-type" className="text-sm font-medium mb-2 block">User Type</label>
                    <select
                      id="user-type"
                      className="w-full p-2 border border-border/50 rounded-lg bg-background"
                    >
                      <option>Environmental NGO</option>
                      <option>Government Authority</option>
                      <option>Disaster management departments</option>
                      <option>Fisherfolk</option>
                      <option>Civil Defence Teams</option>
                      <option>General Public</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="expertise-area" className="text-sm font-medium mb-2 block">Expertise Area</label>
                    <select
                      id="expertise-area"
                      className="w-full p-2 border border-border/50 rounded-lg bg-background"
                    >
                      <option>Marine Conservation</option>
                      <option>Climate Science</option>
                      <option>Coastal Engineering</option>
                      <option>Environmental Policy</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t border-border/50">
                <Button variant="hero">
                  <Settings className="w-4 h-4 mr-2" />
                  Update Profile
                </Button>
              </div>
            </Card>

            {/* Notification Preferences */}
            <Card className="card-oceanic p-6">
              <h3 className="text-xl font-semibold text-gradient mb-6">Notification Preferences</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted/20 rounded-lg">
                  <div>
                    <h4 className="font-medium">Storm Surge Alerts</h4>
                    <p className="text-sm text-muted-foreground">High-priority coastal flooding warnings</p>
                  </div>
                  <Switch
                    checked={notifications.stormSurge}
                    onCheckedChange={(checked) => 
                      setNotifications(prev => ({ ...prev, stormSurge: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-muted/20 rounded-lg">
                  <div>
                    <h4 className="font-medium">Pollution Monitoring</h4>
                    <p className="text-sm text-muted-foreground">Air and water quality alerts</p>
                  </div>
                  <Switch
                    checked={notifications.pollution}
                    onCheckedChange={(checked) => 
                      setNotifications(prev => ({ ...prev, pollution: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-muted/20 rounded-lg">
                  <div>
                    <h4 className="font-medium">Coastal Erosion</h4>
                    <p className="text-sm text-muted-foreground">Shoreline change notifications</p>
                  </div>
                  <Switch
                    checked={notifications.erosion}
                    onCheckedChange={(checked) => 
                      setNotifications(prev => ({ ...prev, erosion: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-muted/20 rounded-lg">
                  <div>
                    <h4 className="font-medium">Algal Blooms</h4>
                    <p className="text-sm text-muted-foreground">Harmful algal bloom detection</p>
                  </div>
                  <Switch
                    checked={notifications.algalBlooms}
                    onCheckedChange={(checked) => 
                      setNotifications(prev => ({ ...prev, algalBlooms: checked }))
                    }
                  />
                </div>
              </div>
            </Card>

            {/* Recent Activity */}
            <Card className="card-oceanic p-6">
              <h3 className="text-xl font-semibold text-gradient mb-6">Recent Activity</h3>
              
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center space-x-4 p-4 bg-muted/10 rounded-lg">
                    <div className="w-8 h-8 ocean-gradient rounded-full flex items-center justify-center">
                      <Activity className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{activity.title}</p>
                      <p className="text-sm text-muted-foreground">{activity.timestamp}</p>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={activity.status === 'verified' ? 'bg-success/10 text-success border-success/20' : 'bg-primary/10 text-primary border-primary/20'}
                    >
                      {activity.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;