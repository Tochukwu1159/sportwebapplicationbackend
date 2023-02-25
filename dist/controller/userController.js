"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUsers = exports.updateUserRecord = exports.changePassword = exports.forgotPassword = exports.verifyUser = exports.loginUser = exports.createUser = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const uuid_1 = require("uuid");
const utils_1 = require("../utils/utils");
const user_1 = require("../model/user");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const sendmail_1 = __importDefault(require("../email/sendmail"));
const emailVerification_1 = require("../email/emailVerification");
const passPhrase = process.env.JWT_SECRET;
const fromUser = process.env.FROM;
const subject = process.env.SUBJECT;
const subject2 = process.env.SUBJECT2;
async function createUser(req, res) {
    try {
        let newId = (0, uuid_1.v4)();
        const validationResult = utils_1.createUserSchema.validate(req.body, utils_1.options);
        //  console.log("d")
        if (validationResult.error) {
            return res.status(400).json({
                error: validationResult.error.details[0].message,
            });
        }
        //  console.log("e")
        const duplicateEmail = await user_1.UserInstance.findOne({
            where: { email: req.body.email },
        });
        if (duplicateEmail) {
            return res.status(409).json({
                error: 'email is already taken',
            });
        }
        const duplicatePhoneNumber = await user_1.UserInstance.findOne({
            where: {
                phonenumber: req.body.phonenumber,
            },
        });
        if (duplicatePhoneNumber) {
            return res.status(409).json({
                error: 'phone number already exists',
            });
        }
        const duplicateUsername = await user_1.UserInstance.findOne({
            where: {
                username: req.body.username
            },
        });
        if (duplicateUsername) {
            return res.status(409).json({
                error: 'Username already taken',
            });
        }
        const passwordHash = await bcryptjs_1.default.hash(req.body.password, 8);
        const record = await user_1.UserInstance.create({
            id: newId,
            email: req.body.email,
            username: req.body.username,
            interest: req.body.interest,
            phonenumber: req.body.phonenumber,
            avatar: 'https://cdn-icons-png.flaticon.com/512/1160/1160040.png?w=740& t=st=1663662557~exp=1663663157~hmac=534541c319dd6da1c7554d1fabb39370d4af64705b9a26bce48c6a08c2555fd8',
            password: passwordHash,
            isVerified: false,
        });
        const ExistingUser = (await user_1.UserInstance.findOne({
            where: { email: req.body.email },
        }));
        const token = (0, utils_1.generateToken)({ id: ExistingUser.id });
        const html = (0, emailVerification_1.emailVerificationView)(token);
        await (0, sendmail_1.default)(fromUser, ExistingUser.email, subject, html);
        // await sendMails.verifyUserEmail(ExistingUser.email, token as string);
        return res.status(201).json({
            message: 'user created successfully',
            record,
            token,
        });
    }
    catch (error) {
        return res.status(500).json({
            error: 'error',
        });
    }
}
exports.createUser = createUser;
async function loginUser(req, res) {
    try {
        const { userInfo, password } = req.body;
        const validationResult = utils_1.loginUserSchema.validate(req.body, utils_1.options);
        if (validationResult.error) {
            return res.status(400).json({ error: validationResult.error.details[0].message });
        }
        let User = (await user_1.UserInstance.findOne({ where: { username: userInfo } }));
        if (!User) {
            User = (await user_1.UserInstance.findOne({ where: { email: userInfo } }));
        }
        if (!User) {
            return res.status(403).json({ error: 'User not found' });
        }
        if (!User.isVerified) {
            return res.status(403).json({ error: 'User not verified' });
        }
        const { id } = User;
        const token = (0, utils_1.generateToken)({ id });
        const validUser = await bcryptjs_1.default.compare(password, User.password);
        if (!validUser) {
            return res.status(401).json({ error: 'Password do not match' });
        }
        if (validUser) {
            return res.status(200).json({ message: 'Login successful', token, User });
        }
    }
    catch (error) {
        return res.status(500).json({
            error: 'failed to login user',
        });
        //  throw new Error(`${error}`);
    }
}
exports.loginUser = loginUser;
async function verifyUser(req, res) {
    try {
        const { token } = req.params;
        console.log(token, "dghi");
        const verified = jsonwebtoken_1.default.verify(token, passPhrase);
        console.log(verified);
        const { id } = verified;
        const record = await user_1.UserInstance.findOne({
            where: {
                id: id,
            },
        });
        if (!record) {
            return res.status(404).json({
                error: 'User not found',
            });
        }
        await record?.update({
            isVerified: true,
        });
        return res.status(302).redirect(`${process.env.FRONTEND_URL}/login`);
    }
    catch (error) {
        return res.status(500).json({
            error: 'Server error try again later',
        });
    }
}
exports.verifyUser = verifyUser;
// export async function forgotPassword(req: Request, res: Response): Promise<unknown> {
//   try {
//     const { email } = req.body;
//     console.log("a")
//     const user = (await UserInstance.findOne({
//       where: {
//         email: email,
//       },
//     })) as unknown as { [key: string]: string };
//     if (!user) {
//       return res.status(404).json({
//         error: 'email not found',
//       });
//     }
//     const { id } = user;
//     sendMails.verifyUserEmail(user.email, token);
//     return res.status(200).json({
//       message: 'Check email for the verification link',
//     });
//   } catch (error) {
//     return res.status(500).json({
//       error,
//     });
//     throw new Error(`${error}`);
//   }
// }
async function forgotPassword(req, res) {
    try {
        const { email } = req.body;
        const user = (await user_1.UserInstance.findOne({
            where: {
                email: email,
            },
        }));
        if (!user) {
            return res.status(404).json({
                message: 'email not found',
            });
        }
        const { id } = user;
        const html = (0, emailVerification_1.forgotPasswordVerification)(id);
        await (0, sendmail_1.default)(fromUser, req.body.email, subject, html);
        res.status(200).json({
            message: 'Check email for the verification link',
        });
    }
    catch (error) {
        res.status(500);
        throw new Error(`${error}`);
    }
}
exports.forgotPassword = forgotPassword;
async function changePassword(req, res) {
    try {
        const { id } = req.params;
        const validationResult = utils_1.changePasswordSchema.validate(req.body, utils_1.options);
        if (validationResult.error) {
            return res.status(400).json({
                error: validationResult.error.details[0].message,
            });
        }
        const user = await user_1.UserInstance.findOne({
            where: {
                id: id,
            },
        });
        if (!user) {
            return res.status(403).json({
                error: 'user does not exist',
            });
        }
        const passwordHash = await bcryptjs_1.default.hash(req.body.password, 8);
        await user?.update({
            password: passwordHash,
        });
        return res.status(200).json({
            message: 'Password Successfully Changed',
        });
    }
    catch (error) {
        return res.status(500).json({
            error: 'Internal server error',
        });
        throw new Error(`${error}`);
    }
}
exports.changePassword = changePassword;
async function updateUserRecord(req, res) {
    try {
        const { id } = req.params;
        const record = await user_1.UserInstance.findOne({ where: { id } });
        console.log("a");
        if (!record) {
            return res.status(400).json({ error: 'Invalid ID, User not found' });
        }
        if (req.body.username) {
            const check = (await user_1.UserInstance.findOne({ where: { username: req.body.username } }));
            if (check && check.id !== id) {
                return res.status(403).json({ error: 'Username already taken' });
            }
        }
        const updateRecord = {
            email: req.body.email,
            username: req.body.username,
            interest: req.body.interest,
            phonenumber: req.body.phonenumber,
            avatar: req.body.avatar,
        };
        const validateUpdate = utils_1.userUpdateSchema.validate(updateRecord, utils_1.options);
        if (validateUpdate.error) {
            return res.status(400).json({ error: validateUpdate.error.details[0].message });
        }
        const updateUserRecord = await record?.update(updateRecord);
        return res.status(200).json({
            message: 'Update Successful',
            record: updateUserRecord,
        });
    }
    catch (error) {
        return res.status(500).json({
            error: 'Failed to update record',
            route: '/patch/:id',
        });
    }
}
exports.updateUserRecord = updateUserRecord;
async function getUsers(req, res, next) {
    try {
        const limit = req.query?.limit;
        const offset = req.query?.offset;
        const record = await user_1.UserInstance.findAndCountAll({
            limit, offset
        });
        res.status(200).json({
            msg: "You have successfully fetch all users",
            count: record.count,
            record: record.rows,
        });
    }
    catch (error) {
        res.status(500).json({
            msg: "failed to read",
            route: "/read",
        });
    }
}
exports.getUsers = getUsers;
