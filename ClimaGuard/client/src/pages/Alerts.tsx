import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { AlertTriangle, Waves, Mountain, Zap, Droplets, Users, MessageCircle, Heart, Share2 } from 'lucide-react';

const Alerts = () => {
  const [newPost, setNewPost] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const alertCategories = [
    {
      id: 'storm',
      title: 'Storm Surge',
      icon: Waves,
      color: 'text-blue-500',
      description: 'Coastal flooding and storm surge warnings',
      why: 'Storm surges can cause devastating flooding, property damage, and pose serious threats to coastal communities.',
      posts: 3,
      urgency: 'high'
    },
    {
      id: 'erosion',
      title: 'Soil Erosion',
      icon: Mountain,
      color: 'text-orange-500',
      description: 'Coastal and inland erosion monitoring',
      why: 'Soil erosion threatens infrastructure, agricultural land, and natural habitats, requiring immediate attention.',
      posts: 5,
      urgency: 'medium'
    },
    {
      id: 'pollution',
      title: 'Pollution Alert',
      icon: Zap,
      color: 'text-red-500',
      description: 'Air and water pollution monitoring',
      why: 'Pollution directly impacts human health, marine life, and ecosystem balance, demanding urgent action.',
      posts: 8,
      urgency: 'high'
    },
    {
      id: 'algae',
      title: 'Algal Blooms',
      icon: Droplets,
      color: 'text-green-500',
      description: 'Harmful algal bloom detection',
      why: 'Algal blooms can produce toxins harmful to marine life, drinking water, and recreational activities.',
      posts: 2,
      urgency: 'medium'
    },
    {
      id: 'coral',
      title: 'Coral Bleaching',
      icon: Heart,
      color: 'text-pink-500',
      description: 'Coral reef health monitoring',
      why: 'Coral reefs support marine biodiversity and protect coastlines from erosion and storm damage.',
      posts: 4,
      urgency: 'medium'
    }
  ];

  const samplePosts = [
    {
      id: 1,
      category: 'storm',
      title: 'Severe Storm Surge Warning - East Coast',
      content: 'Meteorological data indicates a major storm system approaching with 3-4 meter surge potential. Immediate evacuation recommended for zones A and B.',
      author: 'Marine Weather Service',
      userType: 'authority',
      timestamp: '2 hours ago',
      likes: 24,
      comments: 8,
      urgent: true
    },
    {
      id: 2,
      category: 'pollution',
      title: 'Industrial Runoff Detected',
      content: 'Our local fishing community has noticed unusual water coloration near the industrial district. pH levels seem abnormal. Requesting official testing.',
      author: 'Local Fisher Union',
      userType: 'fisherfolk',
      timestamp: '4 hours ago',
      likes: 17,
      comments: 12,
      urgent: false
    },
    {
      id: 3,
      category: 'erosion',
      title: 'Coastal Road Infrastructure at Risk',
      content: 'Recent high tide cycles have accelerated erosion along Highway 101. Road foundation showing stress signs. Engineering assessment needed urgently.',
      author: 'Coastal Engineering Dept',
      userType: 'authority',
      timestamp: '6 hours ago',
      likes: 31,
      comments: 15,
      urgent: true
    }
  ];

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'medium': return 'bg-warning/10 text-warning border-warning/20';
      default: return 'bg-success/10 text-success border-success/20';
    }
  };

  const getUserTypeColor = (userType: string) => {
    switch (userType) {
      case 'authority': return 'bg-primary/10 text-primary';
      case 'ngo': return 'bg-accent/10 text-accent';
      case 'fisherfolk': return 'bg-blue-500/10 text-blue-500';
      default: return 'bg-muted/10 text-muted-foreground';
    }
  };

  const filteredPosts = selectedCategory === 'all' 
    ? samplePosts 
    : samplePosts.filter(post => post.category === selectedCategory);

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gradient mb-4">Environmental Alerts</h1>
          <p className="text-xl text-muted-foreground">Community-driven environmental monitoring and reporting</p>
        </div>

        {/* Alert Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
          {alertCategories.map((category, index) => {
            const Icon = category.icon;
            return (
              <Card 
                key={category.id}
                className={`card-oceanic hover-lift p-6 cursor-pointer transition-all duration-300 animate-fade-up ${
                  selectedCategory === category.id ? 'ring-2 ring-primary shadow-lg' : ''
                }`}
                style={{ animationDelay: `${index * 0.1}s` }}
                onClick={() => setSelectedCategory(category.id)}
              >
                <div className="text-center">
                  <div className="w-12 h-12 ocean-gradient rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold mb-2">{category.title}</h3>
                  <p className="text-xs text-muted-foreground mb-3">{category.description}</p>
                  
                  <div className="flex items-center justify-between mb-3">
                    <Badge variant="outline" className={getUrgencyColor(category.urgency)}>
                      {category.urgency.toUpperCase()}
                    </Badge>
                    <span className="text-sm text-muted-foreground">{category.posts} posts</span>
                  </div>
                  
                  <div className="text-xs text-muted-foreground text-left">
                    <strong>Why it matters:</strong> {category.why}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Filter and Post Creation */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Posts Feed */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-gradient">
                {selectedCategory === 'all' ? 'All Alerts' : 
                 alertCategories.find(c => c.id === selectedCategory)?.title + ' Alerts'}
              </h2>
              <Button 
                variant="outline" 
                onClick={() => setSelectedCategory('all')}
                disabled={selectedCategory === 'all'}
              >
                Show All
              </Button>
            </div>

            {filteredPosts.map((post, index) => (
              <Card 
                key={post.id} 
                className={`card-oceanic p-6 animate-fade-up ${post.urgent ? 'ring-1 ring-destructive/30' : ''}`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold">{post.author}</span>
                        <Badge variant="outline" className={getUserTypeColor(post.userType)}>
                          {post.userType}
                        </Badge>
                      </div>
                      <span className="text-sm text-muted-foreground">{post.timestamp}</span>
                    </div>
                  </div>
                  
                  {post.urgent && (
                    <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">
                      <AlertTriangle className="w-3 h-3 mr-1" />
                      URGENT
                    </Badge>
                  )}
                </div>

                <h3 className="text-lg font-semibold mb-3">{post.title}</h3>
                <p className="text-muted-foreground mb-4">{post.content}</p>

                <div className="flex items-center justify-between pt-4 border-t border-border/50">
                  <div className="flex items-center space-x-4">
                    <Button variant="ghost" size="sm">
                      <Heart className="w-4 h-4 mr-2" />
                      {post.likes}
                    </Button>
                    <Button variant="ghost" size="sm">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      {post.comments}
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Share2 className="w-4 h-4 mr-2" />
                      Share
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Create New Post */}
          <div className="lg:col-span-1">
            <Card className="card-oceanic p-6 sticky top-24">
              <h3 className="text-lg font-semibold text-gradient mb-4">Report an Alert</h3>
              
              <div className="space-y-4">
                <Input placeholder="Alert title..." className="border-border/50" />
                <Textarea 
                  placeholder="Describe the environmental concern..."
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  className="border-border/50 min-h-[100px]"
                />
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Category</label>
                  <select className="w-full p-2 border border-border/50 rounded-lg bg-background">
                    <option>Select category...</option>
                    {alertCategories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.title}</option>
                    ))}
                  </select>
                </div>

                <Button variant="hero" className="w-full">
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Submit Alert
                </Button>
                
                <p className="text-xs text-muted-foreground">
                  Your report will be reviewed by environmental authorities and shared with the community.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Alerts;