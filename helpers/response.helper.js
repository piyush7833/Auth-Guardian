"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResponseHandler = void 0;
var ResponseHandler = function (message, data, status, error, res) {
    return res.status(status).json({
        message: message,
        data: data,
        error: error
    });
};
exports.ResponseHandler = ResponseHandler;
