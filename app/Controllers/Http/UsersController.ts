import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Route from '@ioc:Adonis/Core/Route'
import Drive from '@ioc:Adonis/Core/Drive'
import Env from '@ioc:Adonis/Core/Env'
import Logger from '@ioc:Adonis/Core/Logger'
import User, { UserRole } from 'App/Models/User'
import FileUpload from 'App/Models/FileUpload'
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

    if (role === UserRole.manufacturer) {
      queryUsers.preload('manufacturer', (manufacturer) => {
        manufacturer.preload('logo')
      })
    }

    if (role === UserRole.healthcare) {
      queryUsers.preload('healthcare', (manufacturer) => {
        manufacturer.preload('logo')
      })
    }

    const users = await queryUsers.paginate(page, limit)

    users.baseUrl('/users')

    return users
  }

  public async show({ params, bouncer }: HttpContextContract) {
    const user = await User.findOrFail(params.id)

    await bouncer.with('UserPolicy').authorize('view')

    if (user.role === UserRole.manufacturer) {
      await user.load('manufacturer', (manufacturer) => {
        manufacturer.preload('logo')
      })
    }

    if (user.role === UserRole.healthcare) {
      await user.load('healthcare', (manufacturer) => {
        manufacturer.preload('logo')
      })
    }

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

    const logo = request.file('logo')

    if (user.role === UserRole.manufacturer) {
      const manufacturer = await user.related('manufacturer').create({ name: data.name })

      if (logo) {
        const fileUpload = new FileUpload()

        const subfolder = 'manufacturer-logo'

        const serverBaseUrl = Env.get('SERVER_BASEURL')

        await logo.moveToDisk(subfolder)

        const path = await Drive.getUrl(`${subfolder}/${logo.fileName}`)

        const url = serverBaseUrl + path

        fileUpload.name = `${subfolder}/${logo.fileName}`
        fileUpload.extname = logo.extname
        fileUpload.type = logo.type
        fileUpload.size = logo.size
        fileUpload.path = path
        fileUpload.url = url

        await manufacturer.related('logo').associate(fileUpload)
      }

      await user.load('manufacturer', (manufacturer) => {
        manufacturer.preload('logo')
      })
    }

    if (user.role === UserRole.healthcare) {
      const healthcare = await user.related('healthcare').create({ name: data.name })

      if (logo) {
        const fileUpload = new FileUpload()

        const subfolder = 'healthcare-logo'

        const serverBaseUrl = Env.get('SERVER_BASEURL')

        await logo.moveToDisk(subfolder)

        const path = await Drive.getUrl(`${subfolder}/${logo.fileName}`)

        const url = serverBaseUrl + path

        fileUpload.name = `${subfolder}/${logo.fileName}`
        fileUpload.extname = logo.extname
        fileUpload.type = logo.type
        fileUpload.size = logo.size
        fileUpload.path = path
        fileUpload.url = url

        await healthcare.related('logo').associate(fileUpload)
      }

      await user.load('healthcare', (healthcare) => {
        healthcare.preload('logo')
      })
    }

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

    const logo = request.file('logo', {
      size: '1mb',
      extnames: ['jpg', 'jpeg', 'png', 'webp'],
    })

    if (user.role === UserRole.manufacturer) {
      let manufacturer = await user.related('manufacturer').query().first()

      if (manufacturer) {
        if (logo) {
          if (logo.errors.length) {
            throw new UnprocessableEntityException('logo validation failed', logo.errors)
          }

          const subfolder = 'manufacturer-logo'

          const serverBaseUrl = Env.get('SERVER_BASEURL')

          await logo.moveToDisk(subfolder)

          const path = await Drive.getUrl(`${subfolder}/${logo.fileName}`)

          const url = serverBaseUrl + path

          const fileUpload = await FileUpload.find(manufacturer.logoId)

          if (!fileUpload) {
            const fileUpload = await FileUpload.create({
              name: `${subfolder}/${logo.fileName}`,
              extname: logo.extname,
              type: logo.type,
              size: logo.size,
              path,
              url,
            })

            manufacturer.logoId = fileUpload.id
          } else {
            await Drive.delete(fileUpload.name)

            fileUpload.name = `${subfolder}/${logo.fileName}`
            fileUpload.extname = logo.extname
            fileUpload.type = logo.type
            fileUpload.size = logo.size
            fileUpload.path = path
            fileUpload.url = url

            await fileUpload.save()
          }
        }

        manufacturer.name = data.name
        await manufacturer.save()
      } else {
        manufacturer = await user.related('manufacturer').create({ name: data.name })

        if (logo) {
          const fileUpload = new FileUpload()

          const subfolder = 'manufacturer-logo'

          const serverBaseUrl = Env.get('SERVER_BASEURL')

          await logo.moveToDisk(subfolder)

          const path = await Drive.getUrl(`${subfolder}/${logo.fileName}`)

          const url = serverBaseUrl + path

          fileUpload.name = `${subfolder}/${logo.fileName}`
          fileUpload.extname = logo.extname
          fileUpload.type = logo.type
          fileUpload.size = logo.size
          fileUpload.path = path
          fileUpload.url = url

          await manufacturer.related('logo').associate(fileUpload)
        }
      }
    }

    if (user.role === UserRole.healthcare) {
      let healthcare = await user.related('healthcare').query().first()

      if (healthcare) {
        if (logo) {
          if (logo.errors.length) {
            throw new UnprocessableEntityException('logo validation failed', logo.errors)
          }

          const subfolder = 'healthcare-logo'

          const serverBaseUrl = Env.get('SERVER_BASEURL')

          await logo.moveToDisk(subfolder)

          const path = await Drive.getUrl(`${subfolder}/${logo.fileName}`)

          const url = serverBaseUrl + path

          const fileUpload = await FileUpload.find(healthcare.logoId)

          if (!fileUpload) {
            const fileUpload = await FileUpload.create({
              name: `${subfolder}/${logo.fileName}`,
              extname: logo.extname,
              type: logo.type,
              size: logo.size,
              path,
              url,
            })

            healthcare.logoId = fileUpload.id
          } else {
            await Drive.delete(fileUpload.name)

            fileUpload.name = `${subfolder}/${logo.fileName}`
            fileUpload.extname = logo.extname
            fileUpload.type = logo.type
            fileUpload.size = logo.size
            fileUpload.path = path
            fileUpload.url = url

            await fileUpload.save()
          }
        }

        healthcare.name = data.name
        await healthcare.save()
      } else {
        healthcare = await user.related('healthcare').create({ name: data.name })

        if (logo) {
          const fileUpload = new FileUpload()

          const subfolder = 'healthcare-logo'

          const serverBaseUrl = Env.get('SERVER_BASEURL')

          await logo.moveToDisk(subfolder)

          const path = await Drive.getUrl(`${subfolder}/${logo.fileName}`)

          const url = serverBaseUrl + path

          fileUpload.name = `${subfolder}/${logo.fileName}`
          fileUpload.extname = logo.extname
          fileUpload.type = logo.type
          fileUpload.size = logo.size
          fileUpload.path = path
          fileUpload.url = url

          await healthcare.related('logo').associate(fileUpload)
        }
      }
    }

    await user.load('manufacturer', (manufacturer) => {
      manufacturer.preload('logo')
    })

    await user.load('healthcare', (healthcare) => {
      healthcare.preload('logo')
    })

    return user
  }

  public async destroy({ params }: HttpContextContract) {
    const user = await User.query()
      .where('id', params.id)
      .preload('manufacturer', (manufacturer) => {
        manufacturer.preload('logo')
      })
      .preload('healthcare', (healthcare) => {
        healthcare.preload('logo')
      })
      .first()

    if (!user) {
      throw new NotFoundException('user is not found')
    }

    await user.delete()

    if (user.role === UserRole.manufacturer) {
      if (user.manufacturer.logo) {
        await user.manufacturer.logo.delete()
        await Drive.delete(user.manufacturer.logo.name)
      }
    }

    if (user.role === UserRole.healthcare) {
      if (user.healthcare.logo) {
        await user.healthcare.logo.delete()
        await Drive.delete(user.healthcare.logo.name)
      }
    }

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
