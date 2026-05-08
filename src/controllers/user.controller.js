import asyncWrap from '../utils/asyncWrap.js';
import customError from '../utils/customError.js';
import customResponse from '../utils/customResponse.js';
import User from '../models/user.model.js';
import uploadToCloud from "../utils/cloudinary.js";
import jwt from 'jsonwebtoken';

const generateTokens = async (user) => {
    try {
        const person = await User.findById(user._id);

        const accessToken = person.generateAccessToken();
        const refreshToken = person.generateRefreshToken();

        person.refreshToken = refreshToken;
        await person.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        throw new customError(500, 'Error generating tokens');
    }
};

const refreshAccessTokenController = asyncWrap(async (req, res) => {
    const IncomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!IncomingRefreshToken) {
        throw new customError(401, 'Unauthorized request: No refresh token provided');
    }

    const decoded = await jwt.verify(IncomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);

    const person = await User.findById(decoded?.id);

    if (!person) {
        throw new customError(404, 'User not found');
    }

    if (person.refreshToken !== IncomingRefreshToken) {
        throw new customError(401, 'Unauthorized request: Invalid refresh token');
    }

    const cookieOptions = {
        httpOnly: true,
        secure: true,
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    }

    const { accessToken, newRefreshToken } = await generateTokens(person);

    return res.status(200)
    .cookie('refreshToken', newRefreshToken, cookieOptions)
    .cookie('accessToken', accessToken, cookieOptions)
    .json(new customResponse(200, 'Access token refreshed successfully', 
        {   
            accessToken,
            newRefreshToken
        }
    ));
});

const registerUserController = asyncWrap(async (req, res) => {
    // Extract data from request body
    // Perform validation (e.g., check if email is valid, password strength, etc.)
    // Check if user already exists in the database
    // Check if avatar and cover images are provided and handle file uploads if necessary
    // Upload to Cloodinary if images are provided
    // Create new user in the database
    // Respond with success message and user data (excluding sensitive information like password)

    const {username, email, fullname, password, avatar, coverImage} = req.body;

    if (!username || !email || !fullname || !password) {
        throw new customError(400, 'Missing required fields');
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw new customError(409, 'User already exists');
    }

    const avatarLocal = req.files?.avatar[0]?.path;
    const coverImageLocal = req.files?.coverImage[0]?.path;

    if (!avatarLocal) {
        throw new customError(400, 'Avatar is required');
    }
    if (!coverImageLocal) {
        throw new customError(400, 'Cover image is required');
    }

    const avatarFile = await uploadToCloud(avatarLocal);
    const coverImageFile = await uploadToCloud(coverImageLocal);

    const newUser = new User({
        username,
        email,
        fullname,
        password,
        avatar: avatarFile.url,
        coverImage: coverImageFile.url
    });

    await newUser.save();

    res.status(201).json({
        message: 'User registered successfully',
        user: {
            id: newUser._id,
            username: newUser.username,
            email: newUser.email,
            fullname: newUser.fullname,
            avatar: newUser.avatar,
            coverImage: newUser.coverImage
        }
    });
});

const loginUserController = asyncWrap(async (req, res) => {
    // req -> body
    // check foremail or username
    // check for password
    // access token and refresh token
    // send cookie

    const { email, username, password } = req.body;

    if (!(email || username)) {
        throw new customError(400, 'Email or username is required');
    }
    if (!password) {
        throw new customError(400, 'Password is required');
    }

    const user = await User.findOne({ $or: [{ email }, { username }] });
    if (!user) {
        throw new customError(404, 'User not found');
    }

    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
        throw new customError(401, 'Invalid User Credentials');
    }

    const { accessToken, refreshToken } = await generateTokens(user);

    const cookieOptions = {
        httpOnly: true,
        secure: true,
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    }

    return res.status(200)
    .cookie('refreshToken', refreshToken, cookieOptions)
    .cookie('accessToken', accessToken, cookieOptions)
    .json(new customResponse(200, 'User logged in successfully', 
        {   
            accessToken,
            refreshToken,
            id: user._id,
            username: user.username,
            email: user.email,
            fullname: user.fullname,
            avatar: user.avatar,
            coverImage: user.coverImage
        }
    ));
});

const logoutUserController = asyncWrap(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: { refreshToken: undefined }
        },
        {
            new: true
        }
    )

    const cookieOptions = {
        httpOnly: true,
        secure: true,
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    }

    return res.status(200).clearCookie('refreshToken', cookieOptions).clearCookie('accessToken', cookieOptions)
    .json(new customResponse(200, 'User logged out successfully'));
});

export { registerUserController, loginUserController, logoutUserController, refreshAccessTokenController };