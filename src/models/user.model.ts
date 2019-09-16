import Mongoose, { Model, Schema, Document, model } from 'mongoose';
import bcrypt from 'bcryptjs';
import { uniqueNamesGenerator } from 'unique-names-generator';

export interface IUserDocument extends Document {
  FirstName: string;
  LastName: string;
  Username: string;
  Password: string;
  Email: string;
  PhoneNumber: string;
  Posts: [];
  Connections: [];
}

export interface IUser extends IUserDocument {
  comparePasswords(password: string, callback: any): any;
}

export interface IUserModel extends Model<IUser> {}

const UserSchema: Schema = new Mongoose.Schema(
  {
    FirstName: {
      type: String,
      required: true,
    },
    LastName: {
      type: String,
      required: true,
    },
    Username: {
      type: String,
      unique: true,
      // required: true,
    },
    Password: {
      type: String,
      required: true,
    },
    Email: {
      type: String,
      unique: true,
      required: true,
    },
    PhoneNumber: {
      type: String,
      unique: true,
    },
    Posts: [{ type: Mongoose.Schema.Types.ObjectId, ref: 'Post' }],
    Connections: [{ type: Mongoose.Schema.Types.ObjectId, ref: 'Connection' }],
  },
  { timestamps: true }
);

// Creating a new user;

UserSchema.pre('save', function(this: IUser, next) {
  if (!this.isModified) {
    next();
  }

  if (this.isNew) {
    this.Username = createUsername();
    console.log('Username created successfully => ', this.Username);
    hashPassword(this)
      .then(hash => {
        this.Password = hash;
        console.log('User password hashed! => ', hash);
        next();
      })
      .catch(err => {
        console.log('Error hashing password => ', err);
        next(err);
      });
  } else if (this.isModified('Password')) {
    hashPassword(this)
      .then(hash => {
        this.Password = hash;
        next();
      })
      .catch(err => {
        console.log('Error hashing password => ', err);
        next(err);
      });
  }
});

// UserSchema.method('comparePasswords', function(password: string, cb: any){
//    bcrypt.compare(password,)
// });

UserSchema.methods = {
  comparePasswords(password: string, cb: any) {
    bcrypt
      .compare(password, this.Password)
      .then(isMatch => {
        return cb(null, isMatch);
      })
      .catch(err => {
        throw err;
      });
  },
  //   generateUsername(): string {
  //       const suggestedName = uniqueNamesGenerator({separator: '-'});
  //   }
};

// TODO: Add dictionary of Nigerian things > like Nigerian food
function createUsername(): string {
  let suggestedName = uniqueNamesGenerator({ separator: '-' });
  return (suggestedName += Math.round(Math.random() * 1024));
}

function hashPassword(user: IUser): Promise<string> {
  return bcrypt.hash(user.Password, 10);
}

const User: IUserModel = Mongoose.model<IUser, IUserModel>(
  'User',
  UserSchema,
  'Users'
);

export default User;
