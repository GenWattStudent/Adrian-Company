"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("joi"));
const registerValidation = {
    body: joi_1.default.object({
        email: joi_1.default.string().email().required(),
        password: joi_1.default.string()
            .regex(/[a-zA-Z0-9]{3,30}/, 'password')
            .required(),
        username: joi_1.default.string().alphanum().min(3).max(25).required(),
    }),
};
exports.default = registerValidation;
