"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function globalError(err, req, res, next) {
    if (err) {
        console.log(err, 'global error');
        if (!err.status) {
            res.status(500).json({ message: 'Internal Server Error' });
        }
        res.status(err.status).json({ message: err.message });
    }
}
exports.default = globalError;
