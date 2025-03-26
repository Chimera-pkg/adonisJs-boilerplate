import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Drive from '@ioc:Adonis/Core/Drive'
import Env from '@ioc:Adonis/Core/Env'
import Hash from '@ioc:Adonis/Core/Hash'
import UnprocessableEntityException from 'App/Exceptions/UnprocessableEntityException'
import FileUpload from 'App/Models/FileUpload'
import Healthcare from 'App/Models/Healthcare'
import UpdateHealthcareValidator from 'App/Validators/UpdateHealthcareValidator'
import IndustryCategory from 'App/Models/IndustryCategory'
import Country from 'App/Models/Country'

export default class HealthcaresController {
  public async getProfile({ auth, bouncer }: HttpContextContract) {
    const user = await auth.authenticate()
    await bouncer.with('HealthcarePolicy').authorize('getProfile')

    const healthcare = await Healthcare.firstOrCreate({ userId: user.id }, { userId: user.id })

    await healthcare.load('user')

    await healthcare.load('logo')

    await healthcare.load('industryCategory')

    await healthcare.load('country')

    return healthcare
  }

  public async updateProfile({ request, auth, bouncer }) {
    const user = await auth.authenticate()

    await bouncer.with('HealthcarePolicy').authorize('updateProfile')

    await request.validate(UpdateHealthcareValidator)

    const name = request.input('name')
    const description = request.input('description')
    const industryCategoryId = request.input('industry_category_id')
    const countryId = request.input('country_id')
    const address = request.input('address')
    const currentPassword = request.input('current_password')
    const newPassword = request.input('new_password')
    const confirmNewPassword = request.input('confirm_new_password')

    if (newPassword) {
      if (!currentPassword) {
        throw new UnprocessableEntityException('current password is required')
      }

      if ((await Hash.verify(user.password, currentPassword)) === false) {
        throw new UnprocessableEntityException('current password is incorrect')
      }

      if (newPassword !== confirmNewPassword) {
        throw new UnprocessableEntityException('confirm new password is not same with new password')
      }
    }

    if (industryCategoryId) {
      const industry = await IndustryCategory.find(industryCategoryId)

      if (!industry) {
        throw new UnprocessableEntityException('industry category not found')
      }
    }

    if (countryId) {
      const country = await Country.find(countryId)

      if (!country) {
        throw new UnprocessableEntityException('country not found')
      }
    }

    const healthcare = await Healthcare.updateOrCreate({ userId: user.id }, {})

    const logo = request.file('logo', {
      size: '1mb',
      extnames: ['jpg', 'jpeg', 'png', 'webp'],
    })

    if (logo) {
      if (logo.errors.length) {
        throw new UnprocessableEntityException('logo validation failed', logo.errors)
      }

      const subfolder = 'healthcare-logo'
      await logo.moveToDisk(subfolder)

      const serverBaseUrl = Env.get('SERVER_BASEURL')
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

    healthcare.name = name
    healthcare.description = description

    if (industryCategoryId) {
      healthcare.industryCategoryId = industryCategoryId
    }

    if (countryId) {
      healthcare.countryId = countryId
    }

    healthcare.address = address

    await healthcare.save()

    if (newPassword) {
      user.password = newPassword

      await user.save()
    }

    await healthcare.load('user')

    await healthcare.load('logo')

    await healthcare.load('industryCategory')

    await healthcare.load('country')

    return healthcare
  }
}
