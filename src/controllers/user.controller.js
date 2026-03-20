import asyncWrap from '../utils/asyncWrap.js';

const registerUserController = asyncWrap(async (req, res) => {
    res.status(200).json({
        success: true,
        message: 'User registered successfully',
    });
});

export { registerUserController };