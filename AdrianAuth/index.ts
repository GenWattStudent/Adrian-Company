import express from 'express'
import dontenv from 'dotenv'
dontenv.config()
import globalError from './src/errors/globalError'
import path from 'path'
import AuthDatabase from './src/db/AuthDatabase'
import cookieParser from 'cookie-parser'
import expressLayouts from 'express-ejs-layouts'
import Auth from './src/services/Authenticate'
import router from './src/routes/index'

class Server {
  private app: express.Application = express()
  private port: number = process.env.PORT ? parseInt(process.env.PORT) : 3000
  private auth: Auth = new Auth()
  private authDatabase: AuthDatabase = new AuthDatabase(
    process.env.MONGODB_URI || ''
  )

  public initMiddlewares(): void {
    this.app.use(express.static(path.join(__dirname, 'public')))
    this.app.use(express.json())
    this.app.use(cookieParser())
    this.app.use(express.urlencoded({ extended: true }))
    this.app.set('views', path.join(__dirname, 'views'))
    this.app.set('view engine', 'ejs')
    this.app.set('layout', 'layouts/layout')
    this.app.use(expressLayouts)

    this.authDatabase.connect()
    this.app.use('/', router)

    // Global error handler
    this.app.use(globalError)
  }

  public start(): void {
    this.initMiddlewares()
    this.app.listen(this.port, () => {
      console.log(`Server listening on port ${this.port}`)
    })
  }
}

const server = new Server()

server.start()
