import mongoose from 'mongoose'

const confirmationTokenSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
})

export default mongoose.model('ConfirmationToken', confirmationTokenSchema)
