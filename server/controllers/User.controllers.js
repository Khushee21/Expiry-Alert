import { sendError, sendSuccess } from '../utils/apiResponses.js';
import { generateAndSendOtp, verifyOTP } from '../services/otp.js';
import bcrypt from 'bcrypt';
import { UserModel } from '../models/User.models.js';
import {
    signAccessToken,
    signRefreshToken,
    verifyRefreshToken,
} from "../utils/jwt.js";


//1.Request OTP
export const RequestOTPHandler = async (req, res) => {
    const { email } = req.body;
    console.log(email);
    try {
        if (!email) return sendError(res, "Please provide Email to send Email", 401);
        await generateAndSendOtp(email);
        return sendSuccess(res, null, "OTP send to email", 200);
    } catch (err) {
        console.log("error requesting otp", err);
        return sendError(res, err.message || "Failed to send OTP", 500, err);
    }
};

//2.Verify OTP
export const VerifyOtpHandler = async (req, res) => {
    const { email, code } = req.body;
    try {
        await verifyOTP(email, code);
        return sendSuccess(res, null, "OTP verified", 200);

    } catch (err) {
        return sendError(res, err.message || "OTP verification failed", 400, err);
    }
};

//3.Login
export const signup = async (req, res) => {
    try {
        const { email, password, code } = req.body;
        //console.log(email, password, code);
        if (!email || !password || !code) {
            return sendError(res, "Please provide Email, Password, and OTP code", 401);
        }

        const existingUser = await UserModel.findOne({ email });
        if (existingUser) {
            return sendError(res, "Email already registered", 409);
        }

        await verifyOTP(email, code);

        const hash = await bcrypt.hash(password, 10);
        const user = await UserModel.create({ email, password: hash, emailVerified: true });

        const payload = { userId: user._id, email: user.email };
        const accessToken = signAccessToken(payload);
        const refreshToken = signRefreshToken(payload);

        user.refreshTokens.push(refreshToken);
        user.activeSession = accessToken;
        await user.save();

        const userWithoutPassword = user.toObject();
        delete userWithoutPassword.password;

        return sendSuccess(res, {
            user: {
                _id: userWithoutPassword._id,
                name: userWithoutPassword.email
            },
            accessToken,
            refreshToken,
        }, "Signup Successful", 201);

    } catch (err) {
        console.log("Signup error", err);
        return sendError(res, err.message || "Signup failed", 400, err);
    }
};

//4.login
export const login = async (req, res) => {
    const { email, password } = req.body;
    //console.log(email, password);
    try {
        if (!email || !password)
            return sendError(res, "Please provide Email and Password", 401);

        const user = await UserModel.findOne({ email });
        if (!user)
            return sendError(res, "Invalid credentials. Email not found", 404);
        //console.log(user);
        const match = await bcrypt.compare(password, user.password);
        if (!match)
            return sendError(res, "Invalid credentials. Wrong password", 401);
        //console.log(match);
        // if (user.activeSession)
        //     return sendError(res, "Already logged in on another device", 409);

        const payload = { userId: user._id.toString(), email: user.email };
        // console.log(payload);
        const accessToken = signAccessToken(payload);
        const refreshToken = signRefreshToken(payload);
        //console.log(accessToken);
        // console.log(refreshToken);
        user.refreshTokens = [refreshToken];
        user.activeSession = accessToken;
        await user.save();

        const cleanedUser = user.toObject();
        delete cleanedUser.password;
        delete cleanedUser.refreshTokens;

        return sendSuccess(res, {
            accessToken,
            refreshToken,
            user: {
                _id: cleanedUser._id,
                email: cleanedUser.email,
            }
        }, "Login successful", 200);


    } catch (err) {
        return sendError(res, err.message, 500, err);
    }
};

//5. Refresh token handler 
export const refreshTokenHandler = async (req, res) => {
    const { refreshToken } = req.body;
    try {
        if (!refreshToken) return sendError(res, "Refresh token not provided", 401);

        const payload = verifyRefreshToken(refreshToken);
        const user = await UserModel.findById(payload.userId);

        if (!user || !user.refreshTokens.includes(refreshToken)) {
            return sendError(res, "Invalid refresh token", 403);
        }

        // Rotate tokens (optional but recommended)
        user.refreshTokens = user.refreshTokens.filter(rt => rt !== refreshToken);

        const newRefreshToken = signRefreshToken({
            userId: payload.userId,
            email: payload.email,
        });

        user.refreshTokens.push(newRefreshToken); // Corrected
        await user.save();

        const newAccessToken = signAccessToken({
            userId: payload.userId,
            email: payload.email,
        });

        return sendSuccess(res, {
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
            user: {
                _id: user._id,
                email: user.email,
            },
        }, "Token refreshed", 200);

    } catch (err) {
        return sendError(res, "Could not refresh token", 403, err);
    }
};

//6. Logout handler 
export const logout = async (req, res) => {
    const { refreshToken } = req.body;

    try {
        if (!refreshToken) return sendError(res, "Refresh token required", 400);

        let payload;
        try {
            payload = verifyRefreshToken(refreshToken);
        } catch {
            return sendError(res, "Invalid refresh token", 403);
        }

        const user = await UserModel.findById(payload.userId);
        if (!user) return sendError(res, "Invalid refresh token", 403);

        user.refreshTokens = [];  // Fixed
        user.activeSession = null;
        await user.save();

        return sendSuccess(res, null, "Logged out successfully", 200);

    } catch (err) {
        return sendError(res, "Logout failed", 500, err);
    }
};

//7. reset password using otp