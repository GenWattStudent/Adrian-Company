import User from '../models/User'
import cookieExtractor from '../utils/cookieExtractor'
import { Request, Response, NextFunction } from 'express'
import { LoginData, UserToToken, UserType } from '../../types/types'
import bycrypt from 'bcrypt'
import Tokens from '../utils/tokens'
import HttpError from '../errors/HttpError'

class Auth {
  private tokenManager = new Tokens()

  public login = async (
    req: Request,
    next: NextFunction
  ): Promise<LoginData> => {
    try {
      const { password, email } = req.body
      const user: UserType | null = await User.findOne({ email })

      if (!user || user.provider !== 'local' || !user.password) {
        next(new HttpError(401, 'Invalid email or password'))
        return { accessToken: '', refreshToken: '' }
      }

      const isMatch = await bycrypt.compare(password, user.password)

      if (!isMatch) {
        next(new HttpError(401, 'Invalid email or password'))
        return { accessToken: '', refreshToken: '' }
      }

      const { accessToken, refreshToken } =
        this.tokenManager.createAccessAndRefreshToken(user)
      console.log(user, 'user222')
      // update user refresh token
      await User.updateOne({ _id: user._id }, { refreshToken, isLogged: true })

      req.user = user
      return { accessToken, refreshToken }
    } catch (error: any) {
      next(error)
      return { accessToken: '', refreshToken: '' }
    }
  }

  public authenticateJwt = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      // validate token
      const decodedToken = this.tokenManager.verifyAccessToken(
        cookieExtractor(req)
      )
      console.log(decodedToken, 'decoded token')
      if (!decodedToken?.isValid) {
        return next()
      }

      // get payload from token
      const user: UserType | null = await User.findOne({
        _id: decodedToken._id,
        isLogged: true,
      })

      if (!user) {
        return next(new HttpError(401, 'Unauthorized'))
      }
      // set user to req.user
      req.user = user

      next()
    } catch (error) {
      next(error)
    }
  }

  public refreshToken = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    if (!req.user) {
      // check if user is log in and have valid refresh token
      const decodedToken = this.tokenManager.verifyAccessToken(
        cookieExtractor(req)
      )

      if (!decodedToken) {
        return res.redirect('/login')
      }

      const user: UserType | null = await User.findOne({
        _id: decodedToken._id,
        isLogged: true,
      })
      console.log(decodedToken, 'user')
      console.log(user, 'user')
      if (!user) {
        return next(new HttpError(401, 'Unauthorized'))
      }

      // verify refresh token
      const decodedRefreshToken = this.tokenManager.verifyRefreshToken(
        user.refreshToken
      )

      if (!decodedRefreshToken?.isValid) {
        return res.redirect('/login')
      }

      // create new access token
      const { accessToken, refreshToken } =
        this.tokenManager.createAccessAndRefreshToken(user)

      this.tokenManager.saveAccessTokenToCookie(res, accessToken)

      // update user refresh token
      await User.updateOne({ _id: user._id }, { refreshToken, isLogged: true })

      req.user = user

      return next()
    }

    next()
  }

  public authenticateJwtAndRefreshToken = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    this.authenticateJwt(req, res, () => {
      this.refreshToken(req, res, next)
    })
  }
}

export default Auth
