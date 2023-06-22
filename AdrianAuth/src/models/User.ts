import mongoose from 'mongoose'
import bcrypt from 'bcrypt'

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    min: 3,
    max: 25,
  },
  email: {
    type: String,
    required: true,
    max: 50,
    unique: true,
  },
  password: {
    type: String,
    min: 6,
  },
  profilePicture: {
    type: String,
    default: '',
  },
  coverPicture: {
    type: String,
    default: '',
  },
  createdAt: {
    type: Date,
    default: new Date(),
  },
  updatedAt: {
    type: Date,
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  googleId: {
    type: String,
    default: '',
  },
  provider: {
    type: String,
    enum: ['local', 'google'],
    default: 'local',
  },
  refreshToken: {
    type: String,
    default: '',
  },
  isLogged: {
    type: Boolean,
    default: false,
  },
})

UserSchema.pre('save', function (next) {
  console.log('pre save')
  if (!this.isModified('password')) {
    return next()
  }

  if (!this.password) {
    return next()
  }

  bcrypt.hash(this.password, 10, (err, passwordHash) => {
    if (err) {
      return next(err)
    }

    this.password = passwordHash
    next()
  })
})

const User = mongoose.model('Users', UserSchema)

export default User
