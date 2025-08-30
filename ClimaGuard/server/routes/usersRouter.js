const express=require("express");
const router=express.Router();
const upload=require("../config/multer-config");
const {registerUser,loginUser,logoutUser,getUserProfile,updateProfilePhoto}=require("../controllers/userController");
const isLoggedIn=require("../middlewares/isLoggedIn");

router.post("/register",upload.single("profilePhoto"),registerUser);
router.post("/login",upload.none(),loginUser);
router.get("/logout",logoutUser);
router.post("/logout",logoutUser);
router.get("/profile", isLoggedIn, getUserProfile);
router.put('/profile/photo',isLoggedIn, upload.single('profilePhoto'), updateProfilePhoto);


module.exports=router;