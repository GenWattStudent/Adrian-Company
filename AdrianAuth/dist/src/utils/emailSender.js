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
const nodemailer_1 = __importDefault(require("nodemailer"));
const transpoter = nodemailer_1.default.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
    },
});
class EmailSender {
    constructor(transpoter) {
        console.log(transpoter);
        this.transpoter = transpoter;
    }
    sendEmail(options) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.transpoter.sendMail(options);
            }
            catch (error) {
                console.log('E-mail not send: ', error);
            }
        });
    }
}
const emailSender = new EmailSender(transpoter);
exports.default = emailSender;
