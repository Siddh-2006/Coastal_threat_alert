const mongoose=require("mongoose");

const userSchema=mongoose.Schema({
    fullname: {
        type: String,
        required: true,
        trim: true
    },

    isAdmin: { 
        type: Boolean,
        default: false
    },

    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },

    password: {
        type: String,
        required: true
    },

    userType: {
        type: String,
        required: true,
        enum: ['normal_user', 'ngo', 'government', 'disaster_management', 'defence_team'],
        default: 'normal_user'
    },

    location: {
        lat: Number,
        lon: Number,
        address: String, // Added to support text addresses
    },
    pushSubscription: {
        endpoint: String,
        keys: {
        p256dh: String,
        auth: String,
    }
  },
    posts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post", // reference to Post model
      },
    ],  
    
    profilePhoto: {
        type: String,
        default:"https://res.cloudinary.com/dddwnvp4w/image/upload/v1753179130/default-profile_e7m8je.png",
    },

    }, { timestamps: true });


module.exports=mongoose.model("user",userSchema);