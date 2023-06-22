"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
class Tokens {
    createPayload(user) {
        const payload = {
            _id: user._id,
            username: user.username,
            email: user.email,
        };
        return payload;
    }
    createAccessToken(user) {
        const token = jsonwebtoken_1.default.sign(this.createPayload(user), process.env.JWT_SECRET_KEY, {
            expiresIn: '10s',
        });
        return token;
    }
    createRefreshToken(user) {
        const token = jsonwebtoken_1.default.sign(this.createPayload(user), process.env.JWT_REFRESH_KEY, {
            expiresIn: '20s',
        });
        return token;
    }
    createConfirmationToken(email) {
        const token = jsonwebtoken_1.default.sign({ type: 'confirm', email }, process.env.JWT_CONFIRM_KEY, {
            expiresIn: '20m',
        });
        return token;
    }
    createAccessAndRefreshToken(user) {
        const accessToken = this.createAccessToken(user);
        const refreshToken = this.createRefreshToken(user);
        return { accessToken, refreshToken };
    }
    verifyAccessToken(token) {
        try {
            const decodedToken = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET_KEY);
            return Object.assign(Object.assign({}, decodedToken), { isValid: true });
        }
        catch (err) {
            return Object.assign(Object.assign({}, jsonwebtoken_1.default.decode(token)), { isValid: false });
        }
    }
    verifyRefreshToken(token) {
        try {
            const decodedToken = jsonwebtoken_1.default.verify(token, process.env.JWT_REFRESH_KEY);
            return Object.assign(Object.assign({}, decodedToken), { isValid: true });
        }
        catch (err) {
            return Object.assign(Object.assign({}, jsonwebtoken_1.default.decode(token)), { isValid: false });
        }
    }
    saveAccessTokenToCookie(res, token) {
        res.cookie('access_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 1000 * 60 * 60,
        });
    }
}
exports.default = Tokens;
