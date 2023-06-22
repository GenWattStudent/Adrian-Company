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
const mongoose_1 = __importDefault(require("mongoose"));
const Database_1 = __importDefault(require("./Database"));
class AuthDatabase extends Database_1.default {
    constructor(uri, connnectOptions) {
        super();
        this.uri = uri;
        this.connnectOptions = connnectOptions || {};
    }
    connect() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield mongoose_1.default.connect(this.uri, this.connnectOptions);
                console.log('MongoDB connected!');
            }
            catch (err) {
                console.error(err.message);
            }
        });
    }
}
exports.default = AuthDatabase;
