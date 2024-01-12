const { Schema, model } = require('mongoose');
const { handleMongooseError, addUpdateSettings} = require('./hooks');
const Joi = require('joi');

const subscriptionList = ['starter', 'pro', 'business'];

const userSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
    },
    password: {
        type: String,
        required: [true, 'Set password for user'],
    },
    
    subscription: {
        type: String,
        enum: subscriptionList,
        default: 'starter',
    },
    token: {
        type: String,
        default: '',
    },
    avatarURL: {
        type: String,
        required: true,
    },
    verify: {
        type: Boolean,
        default: false,
    },
    verificationToken: {
        type: String,
        
    },
}, { versionKey: false, timestamps: true });

const registerSchema = Joi.object({
    name: Joi.string().min(3).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    
})

const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    
})

const subscriptionSchema = Joi.object({
    subscription: Joi.string().valid(...subscriptionList).required(),
})

const userEmailSchema = Joi.object({
    email: Joi.string().email().required(),
})

const schemas = {
    registerSchema,
    loginSchema,
    subscriptionSchema,
    userEmailSchema,
}

userSchema.post('save', handleMongooseError);
userSchema.pre('findOneAndUpdate', addUpdateSettings);
userSchema.post('findOneAndUpdate', handleMongooseError);

const User = model('user', userSchema);

module.exports = {
    User,
    schemas,
}