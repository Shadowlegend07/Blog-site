const User = require("../models/User");
const Post = require("../models/Post");
const jwt = require("jsonwebtoken");
const { json, redirect } = require("express/lib/response");

// handle errors
const handleErrors = (err) => {
    console.log(err.message, err.code);
    let errors = { email: "", password: "" };

    // incorrect email
    if (err.message === "incorrect email") {
        errors.email = "That email is not registered";
    }

    // incorrect password
    if (err.message === "incorrect password") {
        errors.password = "That password is incorrect";
    }

    // duplicate email error
    if (err.code === 11000) {
        errors.email = "that email is already registered";
        return errors;
    }

    // validation errors
    if (err.message.includes("user validation failed")) {
        // console.log(err);
        Object.values(err.errors).forEach(({ properties }) => {
            // console.log(val);
            // console.log(properties);
            errors[properties.path] = properties.message;
        });
    }

    return errors;
};

// create json web token
const maxAge = 3 * 24 * 60 * 60;
const createToken = (id) => {
    return jwt.sign({ id }, "net ninja secret", {
        expiresIn: maxAge,
    });
};

// controller actions
module.exports.signup_get = (req, res) => {
    res.render("signup");
};

module.exports.add_new_page = (req, res) => {
    res.render("newblog");
};


module.exports.login_get = (req, res) => {
    res.render("login");
};

module.exports.signup_post = async(req, res) => {
    const { email, password, username } = req.body;
    console.log(req.body);
    try {
        const user = await User.create({ email, password, username });
        const token = createToken(user._id);
        res.cookie("jwt", token, { httpOnly: true, maxAge: maxAge * 1000 });
        res.status(201).json({ user: user._id });
    } catch (err) {
        const errors = handleErrors(err);
        res.status(400).json({ errors });
    }
};

module.exports.login_post = async(req, res) => {
    //const username = User.find({username: })
    const { email, password } = req.body;

    try {
        const user = await User.login(email, password);
        const token = createToken(user._id);
        res.cookie("jwt", token, { httpOnly: true, maxAge: maxAge * 1000 });
        res.status(200).json({ user: user._id });
    } catch (err) {
        const errors = handleErrors(err);
        res.status(400).json({ errors });
    }
};
//end of Login Post API
module.exports.new_post = async(req, res) => {
    const { title, content, category } = req.body;

    try {
        const token = req.cookies.jwt;


        jwt.verify(token, "net ninja secret", async(err, decodedToken) => {
            if (err) {
                res.status(405).send(err);
            } else {
                const user_id = decodedToken.id;
                const new_post = await Post.create({
                    user_id: user_id,
                    title: title,
                    content: content,
                    category: category,
                })
                res.redirect("/get_post");
            }
        });
    } //end of try block
    catch (err) {
        res.json({ message: "Something went wrong", err: err });
    } //end of catch block


}; //end of New post api

//display all the post of the user 

module.exports.get_post = async(req, res) => {
    try {
        const token = req.cookies.jwt;
        jwt.verify(token, "net ninja secret", async(err, decodedToken) => {
            if (err) {
                res.send(err);
            } else {
                const us = decodedToken.id;
                const data = await Post.find({ user_id: us });
                res.render("getpost", { data });

            } //end of else
        });

    } catch (err) {
        res.status(405).send(err);
    } //end of catch

}; //end of module


module.exports.logout_get = (req, res) => {
    res.cookie("jwt", "", { maxAge: 1 });
    res.redirect("/");
};