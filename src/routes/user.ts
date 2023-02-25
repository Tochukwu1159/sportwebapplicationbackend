import express from 'express'
import { auth } from "../middleware/auth"
import { changePassword, createUser, forgotPassword, getUsers, loginUser, updateUserRecord, verifyUser } from '../controller/userController';
const router = express.Router();

router.post('/register', createUser)
router.post('/login', loginUser)
router.get('/verify/:token', verifyUser)
router.post('/forgotpassword', forgotPassword)
router.patch('/update/:id', updateUserRecord)
router.patch('/change-password/:id', changePassword)
router.get('/getAllUsers', getUsers)


export default router
