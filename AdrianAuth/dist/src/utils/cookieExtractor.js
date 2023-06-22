"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function cookieExtractor(req) {
    let token = null;
    if (req && req.cookies) {
        token = req.cookies['access_token'];
    }
    return token;
}
exports.default = cookieExtractor;
