import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Env from '@ioc:Adonis/Core/Env'
import Route from '@ioc:Adonis/Core/Route'
import UnprocessableEntityException from 'App/Exceptions/UnprocessableEntityException'
import User, { UserRole } from 'App/Models/User'
import RegisterManufacturerValidator from 'App/Validators/RegisterManufacturerValidator'
import { OAuth2Client, LoginTicket } from 'google-auth-library'
import UnAuthorizedException from 'App/Exceptions/UnAuthorizedException'
import LoginWithGoogleValidator from 'App/Validators/LoginWithGoogleValidator'
import BadRequestException from 'App/Exceptions/BadRequestException'
import Manufacturer from 'App/Models/Manufacturer'
import Healthcare from 'App/Models/Healthcare'
import VerifyEmail from 'App/Mailers/VerifyEmail'
import RegisterHealthcareValidator from 'App/Validators/RegisterHealthcareValidator'
import { AuthenticationException } from '@adonisjs/auth/build/standalone'
import SendEmailVerificationValidator from 'App/Validators/SendEmailVerificationValidator'

const googleClient = new OAuth2Client({
  clientId: Env.get('GOOGLE_CLIENT_ID'),
  clientSecret: Env.get('GOOGLE_CLIENT_SECRET'),
})

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
      throw new UnAuthorizedException('Unauthorized access')
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

  public async registerManufacturer({ request }: HttpContextContract) {
    await request.validate(RegisterManufacturerValidator)

    const email = request.input('email')
    const username = request.input('username')
    const password = request.input('password')

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
    newUser.role = UserRole.manufacturer
    newUser.isVerified = false

    await newUser.save()

    await newUser.related('manufacturer').create({})

    const verificationUrl = this.generateVerificationUrl(newUser.email)

    const resendVerificationUrl = this.generateResendVerificationUrl(newUser.email)

    const verifyEmail = new VerifyEmail(
      'Welcome to MedMap!',
      newUser.email,
      newUser.username,
      verificationUrl,
      resendVerificationUrl
    )

    const isDevelopment = Env.get('NODE_ENV') === 'development'

    const response = {
      message: `Email confirmation sent to ${newUser.email}`,
    } as {
      message: string
      response?: any
    }

    if (isDevelopment) {
      response.response = await verifyEmail.preview()
    } else {
      verifyEmail.send()
    }

    return response
  }

  public async registerHealthcare({ request }: HttpContextContract) {
    await request.validate(RegisterHealthcareValidator)

    const email = request.input('email')
    const username = request.input('username')
    const password = request.input('password')

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
    newUser.role = UserRole.healthcare
    newUser.isVerified = false

    await newUser.save()

    await newUser.related('healthcare').create({})

    const verificationUrl = this.generateVerificationUrl(newUser.email)

    const resendVerificationUrl = this.generateResendVerificationUrl(newUser.email)

    const verifyEmail = new VerifyEmail(
      'Welcome to MedMap!',
      newUser.email,
      newUser.username,
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
      message: `Email confirmation sent to ${newUser.email}`,
      response,
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
      message: 'Email verified succesfully',
    }
  }

  public async loginManufacturerWithGoogle({ request, auth }: HttpContextContract) {
    await request.validate(LoginWithGoogleValidator)

    const idToken = request.input('id_token')

    let ticket: LoginTicket
    try {
      ticket = await googleClient.verifyIdToken({
        idToken,
        audience: Env.get('GOOGLE_CLIENT_ID'),
      })
    } catch (error) {
      throw new BadRequestException(error.message)
    }

    const payload = ticket.getPayload()

    if (!payload) {
      throw new UnAuthorizedException()
    }

    const user = await User.firstOrCreate(
      {
        email: payload.email,
      },
      {
        username: payload.email?.split('@')[0],
        isVerified: payload.email_verified,
        role: UserRole.manufacturer,
      }
    )

    if (user.role !== UserRole.manufacturer) {
      throw new UnAuthorizedException(`user is registered as ${user.role}`)
    }

    const manufacturer = await Manufacturer.findBy('userId', user.id)

    if (!manufacturer) {
      await user.related('manufacturer').create({})
    }

    const token = await auth.use('api').login(user, {
      expiresIn: '7 days',
    })

    return {
      token,
      user: token.user,
    }
  }

  public async loginHealthcareWithGoogle({ request, auth }: HttpContextContract) {
    await request.validate(LoginWithGoogleValidator)

    const idToken = request.input('id_token')

    let ticket: LoginTicket
    try {
      ticket = await googleClient.verifyIdToken({
        idToken,
        audience: Env.get('GOOGLE_CLIENT_ID'),
      })
    } catch (error) {
      throw new BadRequestException(error.message)
    }

    const payload = ticket.getPayload()

    if (!payload) {
      throw new UnAuthorizedException()
    }

    const user = await User.firstOrCreate(
      {
        email: payload.email,
      },
      {
        username: payload.email?.split('@')[0],
        isVerified: payload.email_verified,
        role: UserRole.healthcare,
      }
    )

    if (user.role !== UserRole.healthcare) {
      throw new UnAuthorizedException(`user is registered as ${user.role}`)
    }

    const healthcare = await Healthcare.findBy('userId', user.id)

    if (!healthcare) {
      await user.related('healthcare').create({})
    }

    const token = await auth.use('api').login(user, {
      expiresIn: '7 days',
    })

    return {
      token,
      user: token.user,
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
