"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userController_1 = require("../controller/userController");
const router = express_1.default.Router();
router.post('/register', userController_1.createUser);
router.post('/login', userController_1.loginUser);
router.get('/verify/:token', userController_1.verifyUser);
router.post('/forgotpassword', userController_1.forgotPassword);
router.patch('/update/:id', userController_1.updateUserRecord);
router.patch('/change-password/:id', userController_1.changePassword);
router.get('/getAllUsers', userController_1.getUsers);
exports.default = router;
