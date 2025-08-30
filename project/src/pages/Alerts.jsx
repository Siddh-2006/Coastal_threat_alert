import React, { useState, useEffect } from 'react';
import { AlertTriangle, Waves, TreePine, Droplets, Fish, MessageCircle, Plus, Edit, Trash2, Heart } from 'lucide-react';

const Alerts = ({ user }) => {
  const [selectedCategory, setSelectedCategory] = useState('storm-surge');
  const [posts, setPosts] = useState({});
  const [newPost, setNewPost] = useState({ title: '', content: '', category: 'storm-surge' });
  const [showPostForm, setShowPostForm] = useState(false);
  const [editingPost, setEditingPost] = useState(null);

  const alertCategories = [
    {
      id: 'storm-surge',
      title: 'Storm Surge',
      icon: Waves,
      color: 'blue',
      description: 'Monitoring coastal flooding and storm surge events that threaten communities and infrastructure.',
      importance: 'Critical for protecting lives and property in low-lying coastal areas.'
    },
    {
      id: 'soil-erosion',
      title: 'Soil Erosion',
      icon: TreePine,
      color: 'orange',
      description: 'Tracking coastal and inland soil erosion that affects agricultural productivity and ecosystem stability.',
      importance: 'Essential for maintaining food security and preventing habitat loss.'
    },
    {
      id: 'pollution',
      title: 'Pollution',
      icon: AlertTriangle,
      color: 'red',
      description: 'Detecting air and water pollution that endangers public health and marine ecosystems.',
      importance: 'Vital for protecting community health and preserving biodiversity.'
    },
    {
      id: 'algal-blooms',
      title: 'Algal Blooms',
      icon: Droplets,
      color: 'green',
      description: 'Identifying harmful algal blooms that create dead zones and toxic conditions in water bodies.',
      importance: 'Crucial for maintaining water quality and protecting marine life.'
    },
    {
      id: 'marine-threats',
      title: 'Marine Ecosystem Threats',
      icon: Fish,
      color: 'purple',
      description: 'Monitoring threats to marine biodiversity including overfishing, habitat destruction, and climate impacts.',
      importance: 'Essential for sustainable fisheries and ocean ecosystem preservation.'
    }
  ];

  useEffect(() => {
    // Initialize sample posts for each category
    const samplePosts = {
      'storm-surge': [
        {
          id: 1,
          title: 'Unusual tide patterns observed in Marina Bay',
          content: 'Local fishermen report abnormal tide behaviors. Water levels are 30cm higher than predicted for this time of year.',
          author: 'Captain Rodriguez',
          userType: 'fisherfolk',
          timestamp: new Date(Date.now() - 1000 * 60 * 30),
          likes: 12,
          comments: 3
        }
      ],
      'soil-erosion': [
        {
          id: 2,
          title: 'Accelerated cliff erosion at Sunset Point',
          content: 'Recent satellite imagery shows significant erosion along the cliff face. Residential areas may be at risk.',
          author: 'Dr. Sarah Chen',
          userType: 'researcher',
          timestamp: new Date(Date.now() - 1000 * 60 * 120),
          likes: 18,
          comments: 7
        }
      ],
      'pollution': [
        {
          id: 3,
          title: 'Chemical spill detected near port facility',
          content: 'Environmental sensors detected elevated chemical levels. Authorities have been notified and investigation is underway.',
          author: 'Environmental Response Team',
          userType: 'authority',
          timestamp: new Date(Date.now() - 1000 * 60 * 45),
          likes: 25,
          comments: 12
        }
      ],
      'algal-blooms': [
        {
          id: 4,
          title: 'Red tide bloom spreading in northern waters',
          content: 'Massive algal bloom detected via satellite. Local communities advised to avoid swimming and fishing in affected areas.',
          author: 'Marine Biology Institute',
          userType: 'ngo',
          timestamp: new Date(Date.now() - 1000 * 60 * 90),
          likes: 34,
          comments: 15
        }
      ],
      'marine-threats': [
        {
          id: 5,
          title: 'Coral bleaching event documented',
          content: 'Temperature stress causing widespread coral bleaching. This could impact fish populations and tourism.',
          author: 'Reef Conservation Group',
          userType: 'ngo',
          timestamp: new Date(Date.now() - 1000 * 60 * 180),
          likes: 28,
          comments: 9
        }
      ]
    };
    setPosts(samplePosts);
  }, []);

  const handleCreatePost = () => {
    if (!user) {
      alert('Please login to create posts');
      return;
    }

    if (!newPost.title.trim() || !newPost.content.trim()) {
      alert('Please fill in all fields');
      return;
    }

    const post = {
      id: Date.now(),
      ...newPost,
      author: user.name,
      userType: user.type,
      timestamp: new Date(),
      likes: 0,
      comments: 0
    };

    setPosts(prev => ({
      ...prev,
      [newPost.category]: [...(prev[newPost.category] || []), post]
    }));

    setNewPost({ title: '', content: '', category: selectedCategory });
    setShowPostForm(false);
  };

  const handleDeletePost = (postId, category) => {
    setPosts(prev => ({
      ...prev,
      [category]: prev[category].filter(post => post.id !== postId)
    }));
  };

  const handleEditPost = (post) => {
    setEditingPost(post);
    setNewPost({
      title: post.title,
      content: post.content,
      category: selectedCategory
    });
    setShowPostForm(true);
  };

  const handleUpdatePost = () => {
    if (!newPost.title.trim() || !newPost.content.trim()) {
      alert('Please fill in all fields');
      return;
    }

    setPosts(prev => ({
      ...prev,
      [selectedCategory]: prev[selectedCategory].map(post =>
        post.id === editingPost.id
          ? { ...post, title: newPost.title, content: newPost.content }
          : post
      )
    }));

    setNewPost({ title: '', content: '', category: selectedCategory });
    setShowPostForm(false);
    setEditingPost(null);
  };

  const getUserTypeColor = (userType) => {
    switch (userType) {
      case 'authority': return 'text-blue-400';
      case 'ngo': return 'text-green-400';
      case 'fisherfolk': return 'text-orange-400';
      case 'researcher': return 'text-purple-400';
      default: return 'text-gray-400';
    }
  };

  const getCategoryColor = (categoryId) => {
    const category = alertCategories.find(cat => cat.id === categoryId);
    return category ? category.color : 'blue';
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

  return (
    <div className="pt-20 pb-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Environmental Alert System
          </h1>
          <p className="text-xl text-gray-200">
            Community-driven early warning network for coastal ecosystem protection
          </p>
        </div>

        {/* Category Navigation */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {alertCategories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex items-center space-x-2 px-4 py-3 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 ${
                selectedCategory === category.id
                  ? `bg-${category.color}-500/30 text-${category.color}-300 border-2 border-${category.color}-400`
                  : 'bg-white/10 text-white border-2 border-transparent hover:bg-white/20'
              }`}
            >
              <category.icon className="w-5 h-5" />
              <span>{category.title}</span>
            </button>
          ))}
        </div>

        {/* Current Category Info */}
        {alertCategories.map((category) => (
          selectedCategory === category.id && (
            <div key={category.id} className="mb-8 bg-white/10 backdrop-blur-lg rounded-xl p-6">
              <div className="flex items-center space-x-3 mb-4">
                <category.icon className={`w-8 h-8 text-${category.color}-400`} />
                <h2 className="text-2xl font-bold text-white">{category.title}</h2>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">What We Monitor</h3>
                  <p className="text-gray-200">{category.description}</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Why It Matters</h3>
                  <p className="text-gray-200">{category.importance}</p>
                </div>
              </div>
            </div>
          )
        ))}

        {/* Posts Section */}
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Community Reports</h2>
              {user && (
                <button
                  onClick={() => {
                    setShowPostForm(true);
                    setNewPost({ title: '', content: '', category: selectedCategory });
                    setEditingPost(null);
                  }}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-500/20 text-blue-300 rounded-lg hover:bg-blue-500/30 transition-colors duration-300"
                >
                  <Plus className="w-4 h-4" />
                  <span>New Report</span>
                </button>
              )}
            </div>

            <div className="space-y-4">
              {(posts[selectedCategory] || []).map((post) => (
                <div
                  key={post.id}
                  className="bg-white/10 backdrop-blur-lg rounded-xl p-6 hover:bg-white/15 transition-all duration-300"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-1">{post.title}</h3>
                      <div className="flex items-center space-x-3 text-sm">
                        <span className={`font-medium ${getUserTypeColor(post.userType)}`}>
                          {post.author}
                        </span>
                        <span className="text-gray-400">{formatTimeAgo(post.timestamp)}</span>
                      </div>
                    </div>
                    
                    {user && user.name === post.author && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditPost(post)}
                          className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors duration-300"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeletePost(post.id, selectedCategory)}
                          className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors duration-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                  
                  <p className="text-gray-200 mb-4">{post.content}</p>
                  
                  <div className="flex items-center space-x-4 text-sm">
                    <button className="flex items-center space-x-1 text-gray-400 hover:text-red-400 transition-colors duration-300">
                      <Heart className="w-4 h-4" />
                      <span>{post.likes}</span>
                    </button>
                    <button className="flex items-center space-x-1 text-gray-400 hover:text-blue-400 transition-colors duration-300">
                      <MessageCircle className="w-4 h-4" />
                      <span>{post.comments} comments</span>
                    </button>
                  </div>
                </div>
              ))}
              
              {(!posts[selectedCategory] || posts[selectedCategory].length === 0) && (
                <div className="text-center py-12">
                  <AlertTriangle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-400 text-lg">No reports in this category yet</p>
                  <p className="text-gray-500">Be the first to share important information with the community</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-4">Alert Statistics</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-200">Active Alerts</span>
                  <span className="text-red-400 font-semibold">7</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-200">Resolved Today</span>
                  <span className="text-green-400 font-semibold">23</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-200">Community Reports</span>
                  <span className="text-blue-400 font-semibold">156</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-200">Response Teams</span>
                  <span className="text-purple-400 font-semibold">12</span>
                </div>
              </div>
            </div>

            {/* Emergency Contacts */}
            <div className="bg-gradient-to-br from-red-500/20 to-orange-500/20 backdrop-blur-lg rounded-xl p-6 border border-red-400/30">
              <h3 className="text-xl font-bold text-white mb-4">Emergency Contacts</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-200">Coast Guard</span>
                  <span className="text-white font-mono">911</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-200">Environmental Emergency</span>
                  <span className="text-white font-mono">1-800-424-8802</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-200">Marine Rescue</span>
                  <span className="text-white font-mono">*16</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Post Creation/Edit Form */}
        {showPostForm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 w-full max-w-2xl border border-white/20">
              <h3 className="text-2xl font-bold text-white mb-6">
                {editingPost ? 'Edit Report' : 'Create New Report'}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-white text-sm font-medium mb-2">Title</label>
                  <input
                    type="text"
                    value={newPost.title}
                    onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:border-blue-400 focus:outline-none"
                    placeholder="Describe the threat or observation..."
                  />
                </div>
                
                <div>
                  <label className="block text-white text-sm font-medium mb-2">Details</label>
                  <textarea
                    value={newPost.content}
                    onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:border-blue-400 focus:outline-none resize-none"
                    placeholder="Provide detailed information about the environmental threat..."
                  />
                </div>
                
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      setShowPostForm(false);
                      setEditingPost(null);
                      setNewPost({ title: '', content: '', category: selectedCategory });
                    }}
                    className="px-6 py-2 bg-gray-500/20 text-gray-300 rounded-lg hover:bg-gray-500/30 transition-colors duration-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={editingPost ? handleUpdatePost : handleCreatePost}
                    className="px-6 py-2 bg-blue-500/20 text-blue-300 rounded-lg hover:bg-blue-500/30 transition-colors duration-300"
                  >
                    {editingPost ? 'Update' : 'Create'} Report
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Alerts;