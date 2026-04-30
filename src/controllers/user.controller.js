import asyncWrap from '../utils/asyncWrap.js';
import customError from '../utils/customError.js';
import User from '../models/user.model.js';
import uploadToCloud from "../utils/cloudinary.js";

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

export { registerUserController };