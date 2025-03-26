import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Drive from '@ioc:Adonis/Core/Drive'
import Env from '@ioc:Adonis/Core/Env'
import Hash from '@ioc:Adonis/Core/Hash'
import Manufacturer from 'App/Models/Manufacturer'
import UpdateManufacturerValidator from 'App/Validators/UpdateManufacturerValidator'
import FileUpload from 'App/Models/FileUpload'
import ProductCategory from 'App/Models/ProductCategory'
import UnprocessableEntityException from 'App/Exceptions/UnprocessableEntityException'
import IndustryCategory from 'App/Models/IndustryCategory'
import Country from 'App/Models/Country'

export default class ManufacturersController {
  public async getProfile({ auth, bouncer }: HttpContextContract) {
    const user = await auth.authenticate()
    await bouncer.with('ManufacturerPolicy').authorize('getProfile')

    const manufacturer = await Manufacturer.firstOrCreate({ userId: user.id }, { userId: user.id })

    await manufacturer.load('user')

    await manufacturer.load('logo')

    await manufacturer.load('industryCategory')

    await manufacturer.load('country')

    await manufacturer.load('profileFile')

    await manufacturer.load('categoryOne')

    await manufacturer.load('categoryTwo')

    return manufacturer
  }

  public async updateProfile({ request, auth, bouncer }) {
    const user = await auth.authenticate()

    await bouncer.with('ManufacturerPolicy').authorize('updateProfile')

    await request.validate(UpdateManufacturerValidator)

    const name = request.input('name')
    const picName = request.input('pic_name')
    const description = request.input('description')
    const industryCategoryId = request.input('industry_category_id')
    const countryId = request.input('country_id')
    const address = request.input('address')
    const categoryIdOne = request.input('category_id_one', null)
    const categoryIdTwo = request.input('category_id_two', null)
    const currentPassword = request.input('current_password')
    const newPassword = request.input('new_password')
    const confirmNewPassword = request.input('confirm_new_password')
    const website = request.input('website')
    const video = request.input('video')
    const about = request.input('about')

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

    if (categoryIdOne) {
      const categoryOne = await ProductCategory.find(categoryIdOne)

      if (!categoryOne) {
        throw new UnprocessableEntityException('category_id_one is not found')
      }
    }

    if (categoryIdTwo) {
      const categoryTwo = await ProductCategory.find(categoryIdTwo)

      if (!categoryTwo) {
        throw new UnprocessableEntityException('category_id_ is not found')
      }
    }

    const manufacturer = await Manufacturer.updateOrCreate({ userId: user.id }, {})

    const logo = request.file('logo', {
      size: '1mb',
      extnames: ['jpg', 'jpeg', 'png', 'webp'],
    })

    const profileFile = request.file('profile_file', {
      size: '2mb',
      extnames: ['pdf'],
    })

    if (logo) {
      if (logo.errors.length) {
        throw new UnprocessableEntityException('logo validation failed', logo.errors)
      }

      const subfolder = 'manufacturer-logo'
      await logo.moveToDisk(subfolder)

      const serverBaseUrl = Env.get('SERVER_BASEURL')
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

    if (profileFile) {
      if (profileFile.errors.length) {
        throw new UnprocessableEntityException('profile_file validation failed', profileFile.errors)
      }

      const subfolder = 'manufacturer-profile-file'
      await profileFile.moveToDisk(subfolder)

      const serverBaseUrl = Env.get('SERVER_BASEURL')
      const path = await Drive.getUrl(`${subfolder}/${profileFile.fileName}`)

      const url = serverBaseUrl + path

      const fileUpload = await FileUpload.find(manufacturer.profileFileId)

      if (!fileUpload) {
        const fileUpload = await FileUpload.create({
          name: `${subfolder}/${profileFile.fileName}`,
          extname: profileFile.extname,
          type: profileFile.type,
          size: profileFile.size,
          path,
          url,
        })

        manufacturer.profileFileId = fileUpload.id
      } else {
        await Drive.delete(fileUpload.name)

        fileUpload.name = `${subfolder}/${profileFile.fileName}`
        fileUpload.extname = profileFile.extname
        fileUpload.type = profileFile.type
        fileUpload.size = profileFile.size
        fileUpload.path = path
        fileUpload.url = url

        await fileUpload.save()
      }
    }

    manufacturer.name = name
    manufacturer.picName = picName
    manufacturer.description = description
    if (industryCategoryId) {
      manufacturer.industryCategoryId = industryCategoryId
    }

    if (countryId) {
      manufacturer.countryId = countryId
    }

    manufacturer.address = address
    manufacturer.website = website
    manufacturer.video = video
    manufacturer.about = about

    if (categoryIdOne) {
      manufacturer.categoryIdOne = categoryIdOne
    }

    if (categoryIdTwo) {
      manufacturer.categoryIdTwo = categoryIdTwo
    }

    await manufacturer.save()

    await manufacturer.refresh()

    if (newPassword) {
      user.password = newPassword

      await user.save()
    }

    await manufacturer.load('user')
    await manufacturer.load('industryCategory')
    await manufacturer.load('country')
    await manufacturer.load('logo')
    await manufacturer.load('profileFile')
    await manufacturer.load('categoryOne')
    await manufacturer.load('categoryTwo')

    return manufacturer
  }
}
