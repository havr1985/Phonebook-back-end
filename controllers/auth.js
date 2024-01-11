const { User }  = require('../models/user');
const { ctrlWrapper } = require('../decorators');
const { HttpError, sendEmail, cloudinary } = require('../helpers');
const {nanoid} = require('nanoid')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const gravatar = require('gravatar');
const path = require('path');
const fs = require('fs/promises');
const { SECRET_KEY, BASE_URL } = process.env;

const avatarsDir = path.join(__dirname, '../', 'public', 'avatars');

const register = async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user) {
        throw HttpError(409, 'Email in use');
    };

    const hashPasword = await bcrypt.hash(password, 10);
    const avatarURL = gravatar.url(email);
    const verificationToken = nanoid();

    const newUser = await User.create({ ...req.body, password: hashPasword, avatarURL, verificationToken });
    const verifyEmail = {
        to: email,
        subject: 'Verify email',
        html: `<a target="_blank" href="${BASE_URL}/api/auth/verify/${verificationToken}">Click verify email</a>`
    }

    await sendEmail(verifyEmail);

    res.status(201).json({
        email: newUser.email,
        subscription: newUser.subscription,
    })
};

const verify = async (req, res) => {
    const { verificationToken } = req.params;
    const user = await User.findOne({ verificationToken });
    if (!user) {
        throw HttpError(401, 'User not found');
    }
    await User.findByIdAndUpdate(user._id, { verify: true, verificationToken: "" });

    res.json({
        message: "Verification succesful",
    })
};

const resendVerify = async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
        throw HttpError(401, "User not found");
    }
    if (user.verify) {
        throw HttpError(400, 'Verification has already been passed');
    }
    const verifyEmail = {
        to: email,
        subject: 'Verify email',
        html: `<a target="_blank" href="${BASE_URL}/api/auth/verify/${user.verificationToken}">Click verify email</a>`
    }

    await sendEmail(verifyEmail);

    res.json({
        message: 'Verification email send'
    })
}

const login = async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
        throw HttpError(401, 'Email or password invalid');
    }
    if (!user.verify) {
        throw HttpError(401, 'Email not verified');
    }
    const passwordCompare = await bcrypt.compare(password, user.password);
    if (!passwordCompare) {
        throw HttpError(401, 'Email or password invalid');
    }
    const payload = {
        id: user._id,
    };
    const token = jwt.sign(payload, SECRET_KEY, { expiresIn: "23h" });
    await User.findByIdAndUpdate(user._id, { token });
    res.json({
        token,
        user: { email: email, subscription: user.subscription, },
    })
};

const logout = async (req, res) => {
    const { _id } = req.user;
    console.log(_id)
    await User.findByIdAndUpdate(_id, { token: "" });

    res.json((204), {
        message: "Logout success",
    })
}

const current = async (req, res) => {
    const { email, subscription } = req.user;
    res.json({
        email,
        subscription,
    })
}

const updateSubscription = async (req, res) => {
    const { subscription } = req.body;
    const { _id} = req.user;

    const result = await User.findByIdAndUpdate(_id, { subscription }, { new: true });
    res.json(result);
}

const updateAvatar = async (req, res) => {
    const { _id } = req.user;
    const { url } = await cloudinary.uploader.upload(req.file.path, { folder: 'avatars' });
    
    const avatarURL = url;
    await User.findByIdAndUpdate(_id, { avatarURL });
    await fs.unlink(req.file.path);

    res.json({
        avatarURL,
    })

}

module.exports = {
    register: ctrlWrapper(register),
    verify: ctrlWrapper(verify),
    resendVerify: ctrlWrapper(resendVerify),
    login: ctrlWrapper(login),
    logout: ctrlWrapper(logout),
    current: ctrlWrapper(current),
    updateSubscription: ctrlWrapper(updateSubscription),
    updateAvatar: ctrlWrapper(updateAvatar),
}