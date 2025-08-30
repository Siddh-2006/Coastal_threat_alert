const express = require("express");
const {
  createPost,
  getPosts,
  getPostById,
  updatePost,
  deletePost,
} = require("../controllers/postController");
const  isLoggedIn  = require("../middlewares/isLoggedIn"); // assumes you have authentication

const router = express.Router();

// Create post
router.post("/create", isLoggedIn, createPost);

// Get all posts
router.get("/", getPosts);

// Get single post
router.get("/:id", getPostById);

// Update post
router.put("/:id", isLoggedIn, updatePost);

// Delete post
router.delete("/:id", isLoggedIn, deletePost);

module.exports = router;
