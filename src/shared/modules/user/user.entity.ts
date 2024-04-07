import { defaultClasses, getModelForClass, modelOptions, prop } from '@typegoose/typegoose';
import { User, UserType } from '../../types/index.js';
import { createSHA256 } from '../../helpers/index.js';

export interface UserEntity extends defaultClasses.Base {}

@modelOptions({
  schemaOptions: {
    collection: 'users'
  }
})

export class UserEntity extends defaultClasses.TimeStamps implements User {
  @prop({ unique: true, required: true, default: '' })
  public email: string;

  @prop({ required: true, default: '' })
  private password?: string;

  @prop({
    type: () => String,
    enum: UserType
  })
  public userType: UserType;

  @prop({default: 'Name'})
  public name: string;

  @prop({default: ''})
  public avatar: string;

  constructor(userData: User) {
    super();

    this.email = userData.email;
    this.userType = userData.userType;
    this.name = userData.name;
    this.avatar = userData.avatar;
  }

  public setPassword(password: string, salt: string) {
    this.password = createSHA256(password, salt);
  }

  public getPassword() {
    return this.password;
  }
}

export const UserModel = getModelForClass(UserEntity);