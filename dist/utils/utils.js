"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.options = exports.generateToken = exports.changePasswordSchema = exports.loginUserSchema = exports.userUpdateSchema = exports.createUserSchema = void 0;
const joi_1 = __importDefault(require("joi"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
exports.createUserSchema = joi_1.default.object().keys({
    email: joi_1.default.string().trim().lowercase().required(),
    username: joi_1.default.string().trim().lowercase().required(),
    interest: joi_1.default.string().trim().lowercase().required(),
    phonenumber: joi_1.default.string().required(),
    password: joi_1.default.string().regex(/^[a-zA-Z0-9]{3,30}$/),
    confirm_password: joi_1.default.ref("password")
}).with('password', 'confirm_password');
exports.userUpdateSchema = joi_1.default.object().keys({
    email: joi_1.default.string().trim().lowercase().required(),
    username: joi_1.default.string().trim().lowercase().required(),
    interest: joi_1.default.string().trim().lowercase().required(),
    phonenumber: joi_1.default.string().required(),
    avatar: joi_1.default.string().trim().required(),
});
exports.loginUserSchema = joi_1.default.object().keys({
    userInfo: joi_1.default.string().trim().lowercase().required(),
    password: joi_1.default.string().regex(/^[a-zA-Z0-9]{3,30}$/),
});
exports.changePasswordSchema = joi_1.default.object()
    .keys({
    password: joi_1.default.string().required(),
    confirm_password: joi_1.default.any()
        .equal(joi_1.default.ref('password'))
        .required()
        .label('Confirm password')
        .messages({ 'any.only': '{{#label}} does not match' }),
})
    .with('password', 'confirm_password');
//Generate Token
const generateToken = (user) => {
    const pass = process.env.JWT_SECRET;
    return jsonwebtoken_1.default.sign(user, pass, { expiresIn: '7d' });
};
exports.generateToken = generateToken;
exports.options = {
    abortEarly: false,
    errors: {
        wrap: {
            label: ''
        }
    }
};
