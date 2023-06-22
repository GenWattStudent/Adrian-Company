import { Types, Document } from 'mongoose'

enum MethodTypes {
  GET = 'get',
  POST = 'post',
  PUT = 'put',
  DELETE = 'delete',
}

interface UserBody {
  username: string
  email: string
  password: string
}

interface UserToToken {
  _id: Types.ObjectId
  username: string
  email: string
}

interface UserType extends Document {
  username: string
  email: string
  password: string
  profilePicture: string
  coverPicture: string
  createdAt: Date
  updatedAt: Date
  role: string
  isVerified: boolean
  googleId: string
  provider: string
  refreshToken: string
  isLogged: boolean
}

interface IDecodedToken {
  _id: string
  username: string
  email: string
  iat: number
  exp: number
  isValid: boolean
}

interface LoginData {
  accessToken: string
  refreshToken: string
}

export {
  MethodTypes,
  UserBody,
  UserToToken,
  UserType,
  IDecodedToken,
  LoginData,
}
