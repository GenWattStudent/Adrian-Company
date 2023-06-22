import nodeMailer from 'nodemailer'

const transpoter = nodeMailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
})

class EmailSender {
  private transpoter: nodeMailer.Transporter

  constructor(transpoter: nodeMailer.Transporter) {
    console.log(transpoter)
    this.transpoter = transpoter
  }

  public async sendEmail(options: nodeMailer.SendMailOptions) {
    try {
      await this.transpoter.sendMail(options)
    } catch (error: any) {
      console.log('E-mail not send: ', error)
    }
  }
}

const emailSender = new EmailSender(transpoter)

export default emailSender
