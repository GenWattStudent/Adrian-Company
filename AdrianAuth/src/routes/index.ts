import { Router } from 'express'
import AuthController from '../controllers/AuthController'
import Auth from '../services/Authenticate'

const router = Router()
const authController = new AuthController()
const authenticate = new Auth()

router.get('/register', authController.renderRegister)

router.post('/register', authController.register)

router.get('/login', authController.renderLogin)

router.post('/login', authController.login)

router.get('/confirm', authController.renderConfirm)

router.get('/confirm/:token', authController.confirmEmail)

router.get(
  '/profile',
  authenticate.authenticateJwtAndRefreshToken,
  authController.renderProfile
)

router.get('/', authController.redirectToLogin)

export default router
