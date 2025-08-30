const userModel=require("../models/user-model");
const bcrypt= require("bcrypt");
const jwt=require("jsonwebtoken");
const {generateToken}=require("../utils/generateToken");
const uploadToCloudinary = require("../utils/uploadToCloudinary");
const DEFAULT_PROFILE_PHOTO = "https://res.cloudinary.com/dddwnvp4w/image/upload/v1753179130/default-profile_e7m8je.png";


module.exports.registerUser=async (req,res)=>{
    try{
        let { email,password,fullname,location}=req.body;
        // Step 1: Upload photo if provided
        let profilePhotoUrl = DEFAULT_PROFILE_PHOTO;

        // Upload photo if provided
        if (req.file && req.file.buffer) {
        try {
            profilePhotoUrl = await uploadToCloudinary(req.file.buffer, "profile_photos");
        } catch (uploadErr) {
            console.error("Cloudinary upload failed:", uploadErr.message);
            return res.status(500).send("Photo upload failed");
        }
        }

        let user=await userModel.findOne({email:email});
        if(user) return res.status(401).send("You already have an account, please login..");

        bcrypt.genSalt(10,(err,salt)=>{
            bcrypt.hash(password,salt,async (err,hash)=>{
                if(err) return res.send(err.message);
                else{
                     let user=await userModel.create({
                        email,
                        password:hash,
                        fullname,
                        location,
                        profilePhoto:profilePhotoUrl,
                    });
                    let token=generateToken(user);
                    res.cookie("token", token, {
                        httpOnly: true,
                        sameSite: "None",
                        secure: true,
                     });
                    res.send("User created successfully");
                }
            });
        });

        }catch(err){
            res.status(500).send("Server error");
            // console.log(err.message);
        }
    
}

module.exports.loginUser=async (req,res)=>{
    // console.log("req body",req.body)
    let {email,password,location}=req.body;
    let user=await userModel.findOne({email:email});
    if(!user) return res.send("Email or password incorrect...");

    bcrypt.compare(password,user.password,(err,result)=>{
        if(result){
            let token=generateToken(user);
            res.cookie("token", token, {
                httpOnly: true,
                sameSite: "None",
                secure:true,
            });
            res.status(200).json({ msg: "You can login..", userType: user.userType, token: token });
        }else{
            res.status(401).send("Email or password incorrect..");
        }
    })
}

module.exports.logoutUser = async (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    sameSite: "None",  // Must match how it was set
    secure: true       // Must match how it was set
  });
  res.status(200).send("Logged out successfully");
};

module.exports.getUserProfile = async (req, res) => {
    try {
        const user = await userModel.findById(req.user._id).select("-password");
        res.json(user);
    } catch (err) {
        res.status(500).send("Server error");
    }
};
exports.updateProfilePhoto = async (req, res) => {
  try {
    const userId = req.user._id; // from auth middleware
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const imageUrl = await uploadToCloudinary(file.buffer, 'profile_photos');

    const updatedUser = await userModel.findByIdAndUpdate(
      userId,
      { profilePhoto: imageUrl },
      { new: true }
    );

    res.status(200).json({
      message: 'Profile photo updated successfully',
      profilePhoto: updatedUser.profilePhoto,
    });
  } catch (error) {
    // console.error('Error uploading profile photo:', error);
    res.status(500).json({ error: 'Failed to update profile photo' });
  }
};
