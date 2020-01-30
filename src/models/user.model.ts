import Mongoose, { Model, Schema, Document } from 'mongoose';
// import bcrypt from 'bcryptjs';
// import { uniqueNamesGenerator } from 'unique-names-generator';
// import { store } from '../server';

export interface IUserDocument extends Document {
  FirstName: string;
  LastName: string;
  Username: string;
  PhoneNumber: string;
  Session: string;
  Posts: [];
  Events: [];
  findSession(session: string, callback: any): void;
}

export interface IUser extends IUserDocument {
  FirstName: string;
  LastName: string;
  Username: string;
  PhoneNumber: string;
  Session: string;
  Posts: [];
  Events: [];
  findSession(session: string | undefined, callback: any): void;
}

export interface IUserModel extends Model<IUser> {}

const UserSchema: Schema = new Mongoose.Schema(
  {
    FirstName: {
      type: String,
    },
    LastName: {
      type: String,
    },
    Username: {
      type: String,
    },
    PhoneNumber: {
      type: String,
    },
    Session: {
      type: String,
    },
    Posts: [{ type: Mongoose.Schema.Types.ObjectId, ref: 'Post' }],
    Events: [{}],
  },
  { timestamps: true }
);

// Creating a new user;

// UserSchema.pre('save', function(this: IUser, next) {
//   if (!this.isModified) {
//     next();
//   }

//   if (this.isNew) {
//     this.Username = createUsername();
//     console.log('Username created successfully => ', this.Username);
//     hashPassword(this)
//       .then(hash => {
//         this.Password = hash;
//         console.log('User password hashed! => ', hash);
//         next();
//       })
//       .catch(err => {
//         console.log('Error hashing password => ', err);
//         next(err);
//       });
//   } else if (this.isModified('Password')) {
//     hashPassword(this)
//       .then(hash => {
//         this.Password = hash;
//         next();
//       })
//       .catch(err => {
//         console.log('Error hashing password => ', err);
//         next(err);
//       });
//   }
// });

// UserSchema.method('comparePasswords', function(password: string, cb: any){
//    bcrypt.compare(password,)
// });

UserSchema.methods = {
  // updateSession(session: string, cb: any) {
  //   this
  // }
  // comparePasswords(password: string, cb: any) {
  //   bcrypt
  //     .compare(password, this.Password)
  //     .then(isMatch => {
  //       return cb(null, isMatch);
  //     })
  //     .catch(err => {
  //       throw err;
  //     });
  // },
  //   generateUsername(): string {
  //       const suggestedName = uniqueNamesGenerator({separator: '-'});
  //   }
  // Create function that pushes a post ID in the Posts collection
  // pushPost(postID: Mongoose.Schema.Types.ObjectId) {
  //   this.
  // }
};

// // TODO: Add dictionary of Nigerian things > like Nigerian food
// function createUsername(): string {
//   let suggestedName = uniqueNamesGenerator({ separator: '-' });
//   return (suggestedName += Math.round(Math.random() * 1024));
// }

// function hashPassword(user: IUser): Promise<string> {
//   return bcrypt.hash(user.Password, 10);
// }

const User: IUserModel = Mongoose.model<IUser, IUserModel>(
  'User',
  UserSchema,
  'Users'
);

export default User;
