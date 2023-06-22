"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const User_1 = __importDefault(require("../models/User"));
const cookieExtractor_1 = __importDefault(require("../utils/cookieExtractor"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const tokens_1 = __importDefault(require("../utils/tokens"));
const HttpError_1 = __importDefault(require("../errors/HttpError"));
class Auth {
    constructor() {
        this.tokenManager = new tokens_1.default();
        this.login = (req, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { password, email } = req.body;
                const user = yield User_1.default.findOne({ email });
                if (!user || user.provider !== 'local' || !user.password) {
                    next(new HttpError_1.default(401, 'Invalid email or password'));
                    return { accessToken: '', refreshToken: '' };
                }
                const isMatch = yield bcrypt_1.default.compare(password, user.password);
                if (!isMatch) {
                    next(new HttpError_1.default(401, 'Invalid email or password'));
                    return { accessToken: '', refreshToken: '' };
                }
                const { accessToken, refreshToken } = this.tokenManager.createAccessAndRefreshToken(user);
                console.log(user, 'user222');
                // update user refresh token
                yield User_1.default.updateOne({ _id: user._id }, { refreshToken, isLogged: true });
                req.user = user;
                return { accessToken, refreshToken };
            }
            catch (error) {
                next(error);
                return { accessToken: '', refreshToken: '' };
            }
        });
        this.authenticateJwt = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                // validate token
                const decodedToken = this.tokenManager.verifyAccessToken((0, cookieExtractor_1.default)(req));
                console.log(decodedToken, 'decoded token');
                if (!(decodedToken === null || decodedToken === void 0 ? void 0 : decodedToken.isValid)) {
                    return next();
                }
                // get payload from token
                const user = yield User_1.default.findOne({
                    _id: decodedToken._id,
                    isLogged: true,
                });
                if (!user) {
                    return next(new HttpError_1.default(401, 'Unauthorized'));
                }
                // set user to req.user
                req.user = user;
                next();
            }
            catch (error) {
                next(error);
            }
        });
        this.refreshToken = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            if (!req.user) {
                // check if user is log in and have valid refresh token
                const decodedToken = this.tokenManager.verifyAccessToken((0, cookieExtractor_1.default)(req));
                if (!decodedToken) {
                    return res.redirect('/login');
                }
                const user = yield User_1.default.findOne({
                    _id: decodedToken._id,
                    isLogged: true,
                });
                console.log(decodedToken, 'user');
                console.log(user, 'user');
                if (!user) {
                    return next(new HttpError_1.default(401, 'Unauthorized'));
                }
                // verify refresh token
                const decodedRefreshToken = this.tokenManager.verifyRefreshToken(user.refreshToken);
                if (!(decodedRefreshToken === null || decodedRefreshToken === void 0 ? void 0 : decodedRefreshToken.isValid)) {
                    return res.redirect('/login');
                }
                // create new access token
                const { accessToken, refreshToken } = this.tokenManager.createAccessAndRefreshToken(user);
                this.tokenManager.saveAccessTokenToCookie(res, accessToken);
                // update user refresh token
                yield User_1.default.updateOne({ _id: user._id }, { refreshToken, isLogged: true });
                req.user = user;
                return next();
            }
            next();
        });
        this.authenticateJwtAndRefreshToken = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            this.authenticateJwt(req, res, () => {
                this.refreshToken(req, res, next);
            });
        });
    }
}
exports.default = Auth;
