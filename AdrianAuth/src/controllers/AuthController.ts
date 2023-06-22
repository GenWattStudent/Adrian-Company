import { Request, Response, NextFunction } from 'express'
import { UserBody, UserType } from '../../types/types'
import User from '../models/User'
import registerValidation from '../validators/registerValidation'
import Tokens from '../utils/tokens'
import nodeMailer from 'nodemailer'
import ConfirmationToken from '../models/ConfirmationToken'
import emailSender from '../utils/emailSender'
import jwt from 'jsonwebtoken'
import Auth from '../services/Authenticate'

class AuthController {
  private tokenManager = new Tokens()

  public register = async (
    req: Request<{}, {}, UserBody>,
    res: Response,
    next: NextFunction
  ) => {
    const { username, email, password } = req.body

    try {
      await registerValidation.body.validateAsync(req.body, {
        abortEarly: false,
      })

      // send email with link to confirm
      if (!process.env.EMAIL) return res.json({ error: 'No email' })

      const confirmationToken = this.tokenManager.createConfirmationToken(email)

      // save token in db
      const confirmationTokenModel = new ConfirmationToken({
        token: confirmationToken,
        email,
      })
      await confirmationTokenModel.save()

      const options: nodeMailer.SendMailOptions = {
        from: process.env.EMAIL,
        to: email,
        subject: 'Confirm your email - AdrianAuth',
        html: `
      <h1 style="margin-bottom: 5px">Confirm your e-mail - <strong style="color: #1bc449;">AdrianAuth</strong></h1>
      <a href="${process.env.BASE_URL}/confirm/${confirmationToken}">Click here to confirm your e-mail</a>`,
      }

      const emailResponse = await emailSender.sendEmail(options)

      console.log(emailResponse, 'res')
      const newUser = new User({ username, email, password, provider: 'local' })
      await newUser.save()
      res.redirect('/confirm?email=' + email)
    } catch (error: any) {
      if (error.isJoi) {
        const errors = error.details.map((detail: any) => detail.message)
        res.render('register', { errors, title: 'Register' })
      } else {
        next(error)
      }
    }
  }

  public renderRegister(req: Request, res: Response) {
    res.render('register', { errors: [], title: 'Register' })
  }

  public renderLogin(req: Request, res: Response) {
    res.render('login', { errors: [], appname: 'AdrianAuth', title: 'Login' })
  }

  public login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await new Auth().login(req, next)

      if (!data.accessToken) return
      console.log(data, 'data')
      this.tokenManager.saveAccessTokenToCookie(res, data.accessToken)

      res.redirect('/profile')
    } catch (error) {
      next(error)
    }
  }

  public async renderProfile(req: any, res: Response, next: NextFunction) {
    try {
      res.render('profile', {
        user: req.user,
        title: `Profile - ${req.user.username}`,
      })
    } catch (error: any) {
      next(error)
    }
  }

  public async renderConfirm(
    req: Request<{}, {}, {}, { email: string }>,
    res: Response
  ) {
    res.render('confirmEmail', {
      errors: [],
      email: req.query.email,
      title: 'Confirm your E-mail - AdrianAuth',
    })
  }

  public confirmEmail = async (
    req: Request<{ token: string }>,
    res: Response,
    next: NextFunction
  ) => {
    const confirmationToken = await ConfirmationToken.findOne({
      token: req.params.token,
    })

    if (!confirmationToken) {
      return res.json({ error: 'Invalid token' })
    }

    // check if token is expired
    const result = jwt.verify(
      confirmationToken.token,
      process.env.JWT_CONFIRM_KEY!
    )

    if (!result) {
      return res.json({ error: 'Invalid token' })
    }

    const user: UserType | null = await User.findOne({
      email: confirmationToken.email,
    })

    if (!user) {
      return res.redirect('/register')
    }

    await User.updateOne(
      { email: confirmationToken.email },
      { isVerified: true }
    )

    await ConfirmationToken.deleteOne({ token: req.params.token })

    res.redirect('/login')
  }

  public redirectToLogin(req: Request, res: Response) {
    res.redirect('/login')
  }
}

export default AuthController
