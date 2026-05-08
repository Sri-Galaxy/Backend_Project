import asyncWrap from "../utils/asyncWrap.js";
import customError from "../utils/customError.js";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

const verifyJWT = asyncWrap(async (req, _, next) => {
    const accessToken = req.cookies?.accessToken || req.header("Authorization")?.split(' ')[1];

    if (!accessToken) {
        throw new customError(401, 'Unauthorized');
    }

    const decodedToken = await jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);

    const user = await User.findById(decodedToken?.id).select("-password -refreshToken");

    if (!user) {
        throw new customError(404, 'User not found');
    }

    req.user = user;
    next();
});

export default verifyJWT;