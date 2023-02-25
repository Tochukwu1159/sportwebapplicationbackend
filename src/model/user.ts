import { DataTypes, Model } from "sequelize";
import db from '../config/database.config'


export interface UsersAttributes {
  id: string;
  email:string;
  username: string;
  interest:string;
  phonenumber:string;
  avatar:string;
  password:string;
  isVerified: boolean;
  
}

export class UserInstance extends Model<UsersAttributes> {}

UserInstance.init({
  id: {
    type:DataTypes.UUIDV4,
    primaryKey:true,
    allowNull:false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notNull: {
        msg: 'Email is required',
      },
      notEmpty: {
        msg: 'Email cannot be empty',
      },
    },
  },
interest:{
    type:DataTypes.STRING,
    allowNull:false,
    unique:true,
    validate:{
        notNull:{
            msg:'interest is required'
        },
        notEmpty:{
            msg:'Please provide a a valid interest type'
        }
    }
  },
  username:{
    type:DataTypes.STRING,
    allowNull:false,
    unique:true,
    validate:{
        notNull:{
            msg:'username is required'
        },
        notEmpty:{
            msg:'Please provide a a valid username'
        }
    }
  },
  avatar: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  phonenumber:{
    type:DataTypes.STRING,
    allowNull:false,
    unique:true,
    validate:{
        notNull:{
            msg:'phone number is required'
        },
        notEmpty:{
            msg:'Please provide a valid phone number'
        }
    } 
  },
  password:{
    type:DataTypes.STRING,
    allowNull:false,
    validate:{
        notNull:{
            msg:'password is required'
        },
        notEmpty:{
            msg:'Please provide a password'
        }
    }
  },
  isVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
 
},{
    sequelize:db,
    tableName:'user'
});