const mongoose = require("mongoose");
const { isEmail } = require("validator");
const bcrypt = require("bcrypt");

const PostSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
    },
    title: {
        type: String,
        required: [true, "Title Required"],
    },
    content: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        required: true,
    },
});

const Post = mongoose.model("post", PostSchema);

module.exports = Post;