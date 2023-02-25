import Joi from 'joi'
import jwt from 'jsonwebtoken'
import twilio from "twilio"

const ACCOUNT_SID = process.env.ACCOUNT_SID as string;
const AUTH_TOKEN = process.env.AUTH_TOKEN as string;
const ADMIN_NUMBER = process.env.ADMIN_NUMBER as string;


export const createUserSchema = Joi.object().keys({
    email:Joi.string().trim().lowercase().required(),
    username: Joi.string().trim().lowercase().required(),
    interest:Joi.string().trim().lowercase().required(),
    phonenumber:Joi.string().required(),
    password:Joi.string().regex(/^[a-zA-Z0-9]{3,30}$/),
    confirm_password:Joi.ref("password")
}).with('password', 'confirm_password')



export const userUpdateSchema = Joi.object().keys({
    email:Joi.string().trim().lowercase().required(),
    username: Joi.string().trim().lowercase().required(),
    interest:Joi.string().trim().lowercase().required(),
    phonenumber:Joi.string().required(),
    avatar:Joi.string().trim().required(),
})


export const loginUserSchema = Joi.object().keys({
    userInfo: Joi.string().trim().lowercase().required(),
    password:Joi.string().regex(/^[a-zA-Z0-9]{3,30}$/),
  
})
export const changePasswordSchema = Joi.object()
  .keys({
    password: Joi.string().required(),
    confirm_password: Joi.any()
      .equal(Joi.ref('password'))

      .required()

      .label('Confirm password')

      .messages({ 'any.only': '{{#label}} does not match' }),
  })
  .with('password', 'confirm_password');

//Generate Token
export const generateToken=(user:{[key:string]:unknown}):unknown=>{
  const pass = process.env.JWT_SECRET as string
   return jwt.sign(user,pass, {expiresIn:'7d'})
}



const client = twilio(ACCOUNT_SID,AUTH_TOKEN )
export const GenerateAccessCode = ()=>{
    const code = Math.floor(1000 + Math.random()*9000);
let expiry = new Date();
expiry.setTime(new Date().getTime() + 30 * 60 * 1000);
return {code, expiry};
}


export const SendVerificationCode = async (
    code: number,
    toPhoneNumber: string) => {
      const response = await client.messages.create({
          body: `Your Verification code is ${code} it will expire within 30 minuites`,
          from: ADMIN_NUMBER,
          to: toPhoneNumber.trim()
      }) 
     console.log(response);
     return response;
  };


export const options ={  
    abortEarly:false,
    errors:{
        wrap:{
            label: ''
        }
    }
}