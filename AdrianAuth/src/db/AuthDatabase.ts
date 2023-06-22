import mongoose from 'mongoose'
import Database from './Database'

class AuthDatabase extends Database {
  private uri: string
  private connnectOptions: mongoose.ConnectOptions

  constructor(uri: string, connnectOptions?: mongoose.ConnectOptions) {
    super()
    this.uri = uri
    this.connnectOptions = connnectOptions || {}
  }

  public async connect() {
    try {
      await mongoose.connect(this.uri, this.connnectOptions)
      console.log('MongoDB connected!')
    } catch (err: any) {
      console.error(err.message)
    }
  }
}

export default AuthDatabase
