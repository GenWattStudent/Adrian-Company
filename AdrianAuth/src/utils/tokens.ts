import jwt from 'jsonwebtoken'
import { IDecodedToken, LoginData, UserType } from '../../types/types'
import { Response } from 'express'

class Tokens {
  public createPayload(user: UserType) {
    const payload = {
      _id: user._id,
      username: user.username,
      email: user.email,
    }

    return payload
  }

  public createAccessToken(user: UserType) {
    const token = jwt.sign(
      this.createPayload(user),
      process.env.JWT_SECRET_KEY!,
      {
        expiresIn: '10s',
      }
    )
    return token
  }

  public createRefreshToken(user: UserType) {
    const token = jwt.sign(
      this.createPayload(user),
      process.env.JWT_REFRESH_KEY!,
      {
        expiresIn: '20s',
      }
    )
    return token
  }

  public createConfirmationToken(email: string) {
    const token = jwt.sign(
      { type: 'confirm', email },
      process.env.JWT_CONFIRM_KEY!,
      {
        expiresIn: '20m',
      }
    )
    return token
  }

  public createAccessAndRefreshToken(user: UserType): LoginData {
    const accessToken = this.createAccessToken(user)
    const refreshToken = this.createRefreshToken(user)
    return { accessToken, refreshToken }
  }

  public verifyAccessToken(token: string): IDecodedToken | null {
    try {
      const decodedToken = jwt.verify(
        token,
        process.env.JWT_SECRET_KEY!
      ) as Exclude<IDecodedToken, 'isValid'>
      return { ...decodedToken, isValid: true } as IDecodedToken
    } catch (err) {
      return {
        ...(jwt.decode(token) as Exclude<IDecodedToken, 'isValid'>),
        isValid: false,
      } as IDecodedToken
    }
  }

  public verifyRefreshToken(token: string): IDecodedToken | null {
    try {
      const decodedToken = jwt.verify(
        token,
        process.env.JWT_REFRESH_KEY!
      ) as Exclude<IDecodedToken, 'isValid'>
      return { ...decodedToken, isValid: true } as IDecodedToken
    } catch (err) {
      return {
        ...(jwt.decode(token) as Exclude<IDecodedToken, 'isValid'>),
        isValid: false,
      } as IDecodedToken
    }
  }

  public saveAccessTokenToCookie(res: Response, token: string) {
    res.cookie('access_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 1000 * 60 * 60,
    })
  }
}

export default Tokens
