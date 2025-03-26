import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import NotFoundException from 'App/Exceptions/NotFoundException'
import Drive from '@ioc:Adonis/Core/Drive'
import Env from '@ioc:Adonis/Core/Env'
import FileUpload from 'App/Models/FileUpload'
import GovAffair from 'App/Models/GovAffair'
import CreateGovAffairValidator from 'App/Validators/GovAffair/CreateGovAffairValidator'
import UpdateGovAffairValidator from 'App/Validators/GovAffair/UpdateGovAffairValidator'
import UnprocessableEntityException from 'App/Exceptions/UnprocessableEntityException'
import Country from 'App/Models/Country'

export default class GovAffairsController {
  public async index({ auth, request }: HttpContextContract) {
    const page = request.input('page', 1)
    const limit = request.input('limit', 10)

    let user = auth.user

    const govAffairs = await GovAffair.query()
      .withScopes((scopes) => scopes.visibleTo(user))
      .preload('country')
      .preload('image')
      .paginate(page, limit)

    govAffairs.baseUrl('/gov-affairs')

    return govAffairs
  }

  public async show({ params, bouncer }: HttpContextContract) {
    const idOrSlug = params.id
    const govAffair = await GovAffair.query()
      .where('id', idOrSlug)
      .orWhere('slug', idOrSlug)
      .first()

    if (!govAffair) {
      throw new NotFoundException('gov affair is not found')
    }

    await bouncer.with('GovAffairPolicy').authorize('view', govAffair)

    await govAffair.load('country')
    await govAffair.load('image')

    return govAffair
  }

  public async store({ request, bouncer }) {
    await request.validate(CreateGovAffairValidator)

    await bouncer.with('GovAffairPolicy').authorize('create')

    const title = request.input('title')
    const content = request.input('content')
    const image = request.file('image')
    const countryId = request.input('country_id')
    let isPublished = request.input('is_published', false)

    if (typeof isPublished === 'string') {
      isPublished = isPublished === 'true'
    }

    const country = await Country.find(countryId)

    if (!country) {
      throw new NotFoundException('country is not found')
    }

    const govAffair = new GovAffair()

    if (image) {
      const subfolder = 'gov-affair-image'

      const serverBaseUrl = Env.get('SERVER_BASEURL')

      await image.moveToDisk(subfolder)

      const path = await Drive.getUrl(`${subfolder}/${image.fileName}`)

      const url = serverBaseUrl + path

      const fileUpload = await FileUpload.create({
        name: `${subfolder}/${image.fileName}`,
        extname: image.extname,
        type: image.type,
        size: image.size,
        path,
        url,
      })

      govAffair.imageId = fileUpload.id
    }

    govAffair.title = title
    govAffair.content = content
    govAffair.countryId = country.id
    govAffair.isPublished = isPublished

    await govAffair.save()

    await govAffair.load('country')
    await govAffair.load('image')

    return govAffair
  }

  public async update({ params, request, bouncer }) {
    await request.validate(UpdateGovAffairValidator)

    const govAffair = await GovAffair.find(params.id)

    if (!govAffair) {
      throw new NotFoundException('gov affair is not found')
    }

    await bouncer.with('GovAffairPolicy').authorize('update')

    const title = request.input('title')
    const content = request.input('content')
    const countryId = request.input('country_id')
    const image = request.file('image', {
      size: '1mb',
      extnames: ['jpg', 'jpeg', 'png', 'webp'],
    })

    let isPublished = request.input('is_published')

    if (typeof isPublished === 'string') {
      isPublished = isPublished === 'true'
    }

    if (countryId) {
      const country = await Country.find(countryId)

      if (!country) {
        throw new NotFoundException('country is not found')
      }
    }

    if (image) {
      if (image.errors.length) {
        throw new UnprocessableEntityException('image validation failed', image.errors)
      }
      const subfolder = 'gov-affair-image'
      await image.moveToDisk(subfolder)

      const serverBaseUrl = Env.get('SERVER_BASEURL')
      const path = await Drive.getUrl(`${subfolder}/${image.fileName}`)

      const url = serverBaseUrl + path

      const fileUpload = await FileUpload.find(govAffair.imageId)

      if (!fileUpload) {
        const fileUpload = await FileUpload.create({
          name: `${subfolder}/${image.fileName}`,
          extname: image.extname,
          type: image.type,
          size: image.size,
          path,
          url,
        })

        govAffair.imageId = fileUpload.id
      } else {
        await Drive.delete(fileUpload.name)

        fileUpload.name = `${subfolder}/${image.fileName}`
        fileUpload.extname = image.extname
        fileUpload.type = image.type
        fileUpload.size = image.size
        fileUpload.path = path
        fileUpload.url = url

        await fileUpload.save()
      }
    }

    govAffair.title = title
    govAffair.content = content
    govAffair.isPublished = isPublished

    if (countryId) {
      govAffair.countryId = countryId
    }

    await govAffair.save()

    await govAffair.load('country')
    await govAffair.load('image')

    return govAffair
  }

  public async destroy({ params, bouncer }: HttpContextContract) {
    const govAffair = await GovAffair.find(params.id)

    if (!govAffair) {
      throw new NotFoundException('gov affair is not found')
    }

    await bouncer.with('GovAffairPolicy').authorize('delete')

    await govAffair.delete()

    const fileUpload = await FileUpload.find(govAffair.imageId)

    if (fileUpload) {
      await Drive.delete(fileUpload.name)
      await fileUpload.delete()
    }

    return {
      message: `SUCCESS: gov affair deleted`,
      code: 'SUCCESS',
    }
  }
}
