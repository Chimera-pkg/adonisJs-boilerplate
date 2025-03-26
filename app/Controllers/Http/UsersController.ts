import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Route from '@ioc:Adonis/Core/Route'
import Env from '@ioc:Adonis/Core/Env'
import Logger from '@ioc:Adonis/Core/Logger'
import User, { UserRole } from 'App/Models/User'
import CreateUserValidator from 'App/Validators/User/CreateUserValidator'
import UnprocessableEntityException from 'App/Exceptions/UnprocessableEntityException'
import VerifyEmail from 'App/Mailers/VerifyEmail'
import NotFoundException from 'App/Exceptions/NotFoundException'
import UpdateUserValidator from 'App/Validators/UpdateUserValidator'

export default class UsersController {
  public async index({ request, bouncer }: HttpContextContract) {
    const page = request.input('page', 1)
    const limit = request.input('limit', 10)
    const role = request.input('role', '')

    await bouncer.with('UserPolicy').authorize('viewList')

    const queryUsers = User.query()

    if (role) {
      queryUsers.where('role', role)
    }

    const users = await queryUsers.paginate(page, limit)

    users.baseUrl('/users')

    return users
  }

  public async show({ params, bouncer }: HttpContextContract) {
    const user = await User.findOrFail(params.id)

    await bouncer.with('UserPolicy').authorize('view')

    return user
  }

  public async store({ request }) {
    await request.validate(CreateUserValidator)
    const data = request.only(['name', 'email', 'username', 'password', 'role'])

    const existingUser = await User.query()
      .where('email', data.email)
      .orWhere('username', data.username)
      .first()

    if (existingUser) {
      throw new UnprocessableEntityException('User already exists')
    }

    const user = new User()
    user.email = data.email
    user.username = data.username
    user.role = data.role
    user.password = data.password

    await user.save()

    const verificationUrl = this.generateVerificationUrl(user.email)
    const resendVerificationUrl = this.generateResendVerificationUrl(user.email)

    const verifyEmail = new VerifyEmail(
      'Welcome to MedMap!',
      user.email,
      user.username,
      verificationUrl,
      resendVerificationUrl,
      data.password
    )

    const isDevelopment = Env.get('NODE_ENV') === 'development'
    const isStaging = Env.get('NODE_ENV') === 'staging'

    let response

    if (isDevelopment || isStaging) {
      response = await verifyEmail.preview()
    } else {
      verifyEmail
        .send()
        .then(() => {
          Logger.info(`Verification email sent to ${user.email}`)
        })
        .catch((error) => {
          Logger.error(error)
        })
    }

    return {
      ...user.toJSON(),
      response,
    }
  }

  public async update({ params, request }) {
    await request.validate(UpdateUserValidator)

    const data = request.only(['name', 'email', 'username', 'password', 'role'])

    const user = await User.find(params.id)

    if (!user) {
      throw new NotFoundException('user is not found')
    }

    if (user.email !== data.email) {
      const existingUser = await User.query().where('email', data.email).first()

      if (existingUser) {
        throw new UnprocessableEntityException('User already exists')
      }
    }

    if (user.username !== data.username) {
      const existingUser = await User.query().where('username', data.username).first()

      if (existingUser) {
        throw new UnprocessableEntityException('User already exists')
      }
    }

    user.email = data.email
    user.username = data.username
    user.role = data.role

    if (data.password) {
      user.password = data.password
    }

    await user.save()

    return user
  }

  public async destroy({ params }: HttpContextContract) {
    const user = await User.find(params.id)

    if (!user) {
      throw new NotFoundException('user is not found')
    }

    await user.delete()

    return {
      message: `SUCCESS: user deleted`,
      code: 'SUCCESS',
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