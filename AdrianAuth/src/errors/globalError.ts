import { Request, Response, NextFunction } from 'express'
import { ValidationError } from 'express-validation'

function globalError(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (err) {
    console.log(err, 'global error')
    if (!err.status) {
      res.status(500).json({ message: 'Internal Server Error' })
    }
    res.status(err.status).json({ message: err.message })
  }
}

export default globalError
