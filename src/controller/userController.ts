import express, { Request, Response, NextFunction }
  from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid'
import { options, generateToken, createUserSchema, loginUserSchema, changePasswordSchema, userUpdateSchema } from '../utils/utils'
import { UserInstance, UsersAttributes } from '../model/user'
import bcrypt from 'bcryptjs'
import { SendVerificationCode, GenerateAccessCode } from '../utils/utils'
import sendEmail from '../email/sendmail';
import { emailVerificationView, forgotPasswordVerification } from '../email/emailVerification';

const passPhrase = process.env.JWT_SECRET as string;
const fromUser = process.env.FROM as string;
const subject = process.env.SUBJECT as string;
const subject2 = process.env.SUBJECT2 as string;


export async function createUser(req: Request, res: Response): Promise<unknown> {
  try {
    let newId = uuidv4();



    const validationResult = createUserSchema.validate(req.body, options);
    //  console.log("d")

    if (validationResult.error) {
      return res.status(400).json({
        error: validationResult.error.details[0].message,
      });
    }
    //  console.log("e")
    const duplicateEmail = await UserInstance.findOne({
      where: { email: req.body.email },
    });


    if (duplicateEmail) {
      return res.status(409).json({
        error: 'email is already taken',
      });
    }
  
    const duplicatePhoneNumber = await UserInstance.findOne({
      where: {
        phonenumber: req.body.phonenumber,
      },
    });
  
    if (duplicatePhoneNumber) {
      return res.status(409).json({
        error: 'phone number already exists',
      });
    }
    const duplicateUsername = await UserInstance.findOne({
      where: {
        username: req.body.username
      },
    });

    if (duplicateUsername) {
      return res.status(409).json({
        error: 'Username already taken',
      });
    }

    const passwordHash = await bcrypt.hash(req.body.password, 8);

    const record = await UserInstance.create({

      id: newId,
      email: req.body.email,
      username: req.body.username,
      interest: req.body.interest,
      phonenumber: req.body.phonenumber,
      avatar:
        'https://cdn-icons-png.flaticon.com/512/1160/1160040.png?w=740& t=st=1663662557~exp=1663663157~hmac=534541c319dd6da1c7554d1fabb39370d4af64705b9a26bce48c6a08c2555fd8',
      password: passwordHash,
      isVerified: false,

    });
    
    const ExistingUser = (await UserInstance.findOne({
      where: { email: req.body.email },
    })) as unknown as UsersAttributes;


    const token = generateToken({ id: ExistingUser.id })

    const html = emailVerificationView(token as string);
    await sendEmail(fromUser,ExistingUser.email, subject, html);

    // await sendMails.verifyUserEmail(ExistingUser.email, token as string);

    return res.status(201).json({
      message: 'user created successfully',
      record,
      token,
    });
  } catch (error: any) {
    return res.status(500).json({
      error: 'error',
    });
  }
}

export async function loginUser(req: Request, res: Response): Promise<unknown> {
  try {
    const { userInfo, password } = req.body;

    const validationResult = loginUserSchema.validate(req.body, options);

    if (validationResult.error) {
      return res.status(400).json({ error: validationResult.error.details[0].message });
    }
    let User = (await UserInstance.findOne({ where: { username: userInfo } })) as unknown as { [key: string]: string };

    if (!User) {
      User = (await UserInstance.findOne({ where: { email: userInfo } })) as unknown as { [key: string]: string };
    }

    if (!User) {
      return res.status(403).json({ error: 'User not found' });
    }

    if (!User.isVerified) {
      return res.status(403).json({ error: 'User not verified' });
    }

    const { id } = User;

    const token = generateToken({ id });

    const validUser = await bcrypt.compare(password, User.password);
    if (!validUser) {
      return res.status(401).json({ error: 'Password do not match' });
    }
    if (validUser) {
      return res.status(200).json({ message: 'Login successful', token, User });
    }
  } catch (error) {
    return res.status(500).json({
      error: 'failed to login user',
    });
    //  throw new Error(`${error}`);
  }
}


export async function verifyUser(req: Request, res: Response): Promise<unknown> {
  try {
   
    const { token } = req.params;
    console.log(token, "dghi")

    const verified = jwt.verify(token, passPhrase)
    console.log(verified)

    const { id } = verified as { [key: string]: string };

    const record = await UserInstance.findOne({
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
  } catch (error) {
    return res.status(500).json({
      error: 'Server error try again later',
    });
  }
}
 




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




export async function forgotPassword(req: Request, res: Response): Promise<unknown> {
  try {
    const { email } = req.body;
    const user = (await UserInstance.findOne({
      where: {
        email: email,
      },
    })) as unknown as { [key: string]: string };

    if (!user) {
      return res.status(404).json({
        message: 'email not found',
      });
    }
    const { id } = user;
    const html = forgotPasswordVerification(id);
    await sendEmail(fromUser, req.body.email, subject, html);

    res.status(200).json({
      message: 'Check email for the verification link',
    });
  } catch (error) {
    res.status(500);
    throw new Error(`${error}`);
  }
}







export async function changePassword(req: Request, res: Response): Promise<unknown> {
  try {
    const { id } = req.params;

    const validationResult = changePasswordSchema.validate(req.body, options);
    if (validationResult.error) {
      return res.status(400).json({
        error: validationResult.error.details[0].message,
      });
    }

    const user = await UserInstance.findOne({
      where: {
        id: id,
      },
    });
    if (!user) {
      return res.status(403).json({
        error: 'user does not exist',
      });
    }
    const passwordHash = await bcrypt.hash(req.body.password, 8);
    await user?.update({
      password: passwordHash,
    });
    return res.status(200).json({
      message: 'Password Successfully Changed',
    });
  } catch (error) {
    return res.status(500).json({
      error: 'Internal server error',
    });
    throw new Error(`${error}`);
  }
}



export async function updateUserRecord(req: Request, res: Response): Promise<unknown> {
  try {
    const { id } = req.params;
    const record = await UserInstance.findOne({ where: { id } });

    console.log("a")

    if (!record) {
      return res.status(400).json({ error: 'Invalid ID, User not found' });
    }
    if (req.body.username) {
      const check = (await UserInstance.findOne({ where: { username: req.body.username } })) as unknown as {
        [key: string]: string;
      };

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

    const validateUpdate = userUpdateSchema.validate(updateRecord, options);

    if (validateUpdate.error) {
      return res.status(400).json({ error: validateUpdate.error.details[0].message });
    }

    const updateUserRecord = await record?.update(updateRecord);

    return res.status(200).json({
      message: 'Update Successful',
      record: updateUserRecord,
    });
  } catch (error) {
    return res.status(500).json({
      error: 'Failed to update record',
      route: '/patch/:id',
    });
  }
}

export async function getUsers(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const limit = req.query?.limit as number | undefined;
    const offset = req.query?.offset as number | undefined;
    const record = await UserInstance.findAndCountAll({
      limit, offset
    });
    res.status(200).json({
      msg: "You have successfully fetch all users",
      count: record.count,
      record: record.rows,
    });
  } catch (error) {
    res.status(500).json({
      msg: "failed to read",
      route: "/read",
    });
  }
}