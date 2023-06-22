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
const registerValidation_1 = __importDefault(require("../validators/registerValidation"));
const tokens_1 = __importDefault(require("../utils/tokens"));
const ConfirmationToken_1 = __importDefault(require("../models/ConfirmationToken"));
const emailSender_1 = __importDefault(require("../utils/emailSender"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const Authenticate_1 = __importDefault(require("../services/Authenticate"));
class AuthController {
    constructor() {
        this.tokenManager = new tokens_1.default();
        this.register = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const { username, email, password } = req.body;
            try {
                yield registerValidation_1.default.body.validateAsync(req.body, {
                    abortEarly: false,
                });
                // send email with link to confirm
                if (!process.env.EMAIL)
                    return res.json({ error: 'No email' });
                const confirmationToken = this.tokenManager.createConfirmationToken(email);
                // save token in db
                const confirmationTokenModel = new ConfirmationToken_1.default({
                    token: confirmationToken,
                    email,
                });
                yield confirmationTokenModel.save();
                const options = {
                    from: process.env.EMAIL,
                    to: email,
                    subject: 'Confirm your email - AdrianAuth',
                    html: `
      <h1 style="margin-bottom: 5px">Confirm your e-mail - <strong style="color: #1bc449;">AdrianAuth</strong></h1>
      <a href="${process.env.BASE_URL}/confirm/${confirmationToken}">Click here to confirm your e-mail</a>`,
                };
                const emailResponse = yield emailSender_1.default.sendEmail(options);
                console.log(emailResponse, 'res');
                const newUser = new User_1.default({ username, email, password, provider: 'local' });
                yield newUser.save();
                res.redirect('/confirm?email=' + email);
            }
            catch (error) {
                if (error.isJoi) {
                    const errors = error.details.map((detail) => detail.message);
                    res.render('register', { errors, title: 'Register' });
                }
                else {
                    next(error);
                }
            }
        });
        this.login = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const data = yield new Authenticate_1.default().login(req, next);
                if (!data.accessToken)
                    return;
                console.log(data, 'data');
                this.tokenManager.saveAccessTokenToCookie(res, data.accessToken);
                res.redirect('/profile');
            }
            catch (error) {
                next(error);
            }
        });
        this.confirmEmail = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const confirmationToken = yield ConfirmationToken_1.default.findOne({
                token: req.params.token,
            });
            if (!confirmationToken) {
                return res.json({ error: 'Invalid token' });
            }
            // check if token is expired
            const result = jsonwebtoken_1.default.verify(confirmationToken.token, process.env.JWT_CONFIRM_KEY);
            if (!result) {
                return res.json({ error: 'Invalid token' });
            }
            const user = yield User_1.default.findOne({
                email: confirmationToken.email,
            });
            if (!user) {
                return res.redirect('/register');
            }
            yield User_1.default.updateOne({ email: confirmationToken.email }, { isVerified: true });
            yield ConfirmationToken_1.default.deleteOne({ token: req.params.token });
            res.redirect('/login');
        });
    }
    renderRegister(req, res) {
        res.render('register', { errors: [], title: 'Register' });
    }
    renderLogin(req, res) {
        res.render('login', { errors: [], appname: 'AdrianAuth', title: 'Login' });
    }
    renderProfile(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                res.render('profile', {
                    user: req.user,
                    title: `Profile - ${req.user.username}`,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    renderConfirm(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            res.render('confirmEmail', {
                errors: [],
                email: req.query.email,
                title: 'Confirm your E-mail - AdrianAuth',
            });
        });
    }
    redirectToLogin(req, res) {
        res.redirect('/login');
    }
}
exports.default = AuthController;
