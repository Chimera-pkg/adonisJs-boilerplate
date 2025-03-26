import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Env from '@ioc:Adonis/Core/Env'
import Route from '@ioc:Adonis/Core/Route'
import UnprocessableEntityException from 'App/Exceptions/UnprocessableEntityException'
import User, { UserRole } from 'App/Models/User'
import { AuthenticationException } from '@adonisjs/auth/build/standalone'
import VerifyEmail from 'App/Mailers/VerifyEmail'
import SendEmailVerificationValidator from 'App/Validators/SendEmailVerificationValidator'

export default class AuthController {
  public async login({ request, auth }: HttpContextContract) {
    const email = request.input('email')
    const password = request.input('password')
    const user = await User.findBy('email', email)

    if (!user) {
      throw new AuthenticationException('email is not registered', 'E_UNAUTHORIZED_ACCESS')
    }

    if (!user.password) {
      throw new AuthenticationException('cannot login using password', 'E_UNAUTHORIZED_ACCESS')
    }

    if (!user.isVerified) {
      throw new AuthenticationException('user is not verified yet', 'E_UNAUTHORIZED_ACCESS')
    }

    const token = await auth.use('api').attempt(email, password, {
      expiresIn: '7 days',
    })

    return {
      token,
      user: token.user,
    }
  }

  public async registerAdmin({ request }: HttpContextContract) {
    const email = request.input('email')
    const username = request.input('username')
    const password = request.input('password')

    const appKey = Env.get('APP_KEY')
    const requestAppKey = request.header('x-api-key')

    if (appKey !== requestAppKey) {
      throw new UnprocessableEntityException('Unauthorized access')
    }

    let user = await User.findBy('email', email)

    if (user) {
      throw new UnprocessableEntityException('Email already exist')
    }

    user = await User.findBy('username', username)

    if (user) {
      throw new UnprocessableEntityException('Username already exist')
    }

    const newUser = new User()
    newUser.email = email
    newUser.username = username
    newUser.password = password
    newUser.role = UserRole.admin
    newUser.isVerified = true

    await newUser.save()

    return {
      message: `Admin created successfully`,
    }
  }

  public async sendEmailVerification({ request }: HttpContextContract) {
    await request.validate(SendEmailVerificationValidator)

    const email = request.input('email')

    const user = await User.findBy('email', email)

    if (!user) {
      throw new UnprocessableEntityException('email is not registered')
    }

    if (user.isVerified) {
      throw new UnprocessableEntityException('user with this email already verified')
    }

    const verificationUrl = this.generateVerificationUrl(user.email)

    const resendVerificationUrl = this.generateResendVerificationUrl(user.email)

    const verifyEmail = new VerifyEmail(
      'Welcome to MedMap!',
      user.email,
      user.username,
      verificationUrl,
      resendVerificationUrl
    )

    const isDevelopment = Env.get('NODE_ENV') === 'development'
    const isStaging = Env.get('NODE_ENV') === 'staging'

    let response

    if (isDevelopment || isStaging) {
      response = await verifyEmail.preview()
    } else {
      await verifyEmail.send()
    }

    return {
      message: `Email verification sent to ${user.email}`,
      response,
    }
  }

  public async verifyEmail({ request }: HttpContextContract) {
    if (!request.hasValidSignature()) {
      throw new UnprocessableEntityException('Signature is missing or URL was tampered.')
    }

    const email = request.param('email')

    const user = await User.findBy('email', email)

    if (!user) {
      throw new UnprocessableEntityException('Email is not registered')
    }

    if (user.isVerified) {
      throw new UnprocessableEntityException('Email already verified')
    }

    user.isVerified = true

    await user.save()
    return {
      message: 'Email verified successfully',
    }
  }

  private generateVerificationUrl(email: string): string {
    const url = Route.makeSignedUrl('verifyEmail', { email }, { expiresIn: '24h' })

    const clientWebBaseUrl = Env.get('CLIENT_WEB_BASEURL')

    return `${clientWebBaseUrl}/verify-email?url=${url}`
  }

  private generateResendVerificationUrl(email: string): string {
    const clientWebBaseUrl = Env.get('CLIENT_WEB_BASEURL')

    return `${clientWebBaseUrl}/send-verification?email=${email}`
  }
}