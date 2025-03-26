import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import NotFoundException from 'App/Exceptions/NotFoundException'
import Drive from '@ioc:Adonis/Core/Drive'
import Env from '@ioc:Adonis/Core/Env'
import UnprocessableEntityException from 'App/Exceptions/UnprocessableEntityException'
import Country from 'App/Models/Country'
import FileUpload from 'App/Models/FileUpload'
import RegulationService from 'App/Models/RegulationService'
import RegulationServiceCategory from 'App/Models/RegulationServiceCategory'
import CreateRegulationServiceValidator from 'App/Validators/RegulationService/CreateRegulationServiceValidator'
import UpdateRegulationServiceValidator from 'App/Validators/RegulationService/UpdateRegulationServiceValidator'

export default class RegulationServicesController {
  public async index({ request, auth }: HttpContextContract) {
    const page = request.input('page', 1)
    const limit = request.input('limit', 10)
    const categoryIdsStr: string = request.input('category_ids')
    const countryIdsStr: string = request.input('country_ids')

    const regulationServicesQuery = RegulationService.query()
      .withScopes((scopes) => scopes.visibleTo(auth.user))
      .preload('category')
      .preload('country')
      .preload('image')

    if (categoryIdsStr) {
      const categoryIds = categoryIdsStr.split(',')

      regulationServicesQuery.whereIn('categoryId', categoryIds)
    }

    if (countryIdsStr) {
      const countryIds = countryIdsStr.split(',')
      regulationServicesQuery.whereIn('countryId', countryIds)
    }

    const regulationServices = await regulationServicesQuery.paginate(page, limit)

    regulationServices.baseUrl('/regulation-services')

    return regulationServices
  }

  public async show({ params, bouncer }: HttpContextContract) {
    const regService = await RegulationService.find(params.id)

    if (!regService) {
      throw new NotFoundException('regulation service is not found')
    }

    await bouncer.with('RegulationServicePolicy').authorize('view', regService)

    await regService.load('category')
    await regService.load('country')
    await regService.load('image')

    return regService
  }

  public async store({ request, bouncer }) {
    await bouncer.with('RegulationServicePolicy').authorize('create')

    await request.validate(CreateRegulationServiceValidator)

    const data = request.only(['title', 'content', 'is_published', 'country_id', 'category_id'])

    const regServiceCategory = await RegulationServiceCategory.find(data.category_id)

    if (!regServiceCategory) {
      throw new UnprocessableEntityException('regulation service category is not found')
    }

    const country = await Country.find(data.country_id)

    if (!country) {
      throw new UnprocessableEntityException('country is not found')
    }

    if (typeof data.is_published === 'string') {
      data.is_published = data.is_published === 'true'
    }

    const regService = await RegulationService.create(data)

    const image = request.file('image')
    if (image) {
      const fileUpload = new FileUpload()

      const subfolder = 'regulation-service-image'

      const serverBaseUrl = Env.get('SERVER_BASEURL')

      await image.moveToDisk(subfolder)

      const path = await Drive.getUrl(`${subfolder}/${image.fileName}`)

      const url = serverBaseUrl + path

      fileUpload.name = `${subfolder}/${image.fileName}`
      fileUpload.extname = image.extname
      fileUpload.type = image.type
      fileUpload.size = image.size
      fileUpload.path = path
      fileUpload.url = url

      await regService.related('image').associate(fileUpload)
    }

    await regService.load('category')
    await regService.load('country')
    await regService.load('image')

    return regService
  }

  public async update({ params, request, bouncer }) {
    await bouncer.with('RegulationServicePolicy').authorize('update')

    await request.validate(UpdateRegulationServiceValidator)

    const regService = await RegulationService.find(params.id)

    if (!regService) {
      throw new NotFoundException('regulation service category is not found')
    }

    const data = request.only(['title', 'content', 'is_published', 'country_id', 'category_id'])

    if (data.category_id) {
      const regServiceCategory = await RegulationServiceCategory.find(data.category_id)

      if (!regServiceCategory) {
        throw new UnprocessableEntityException('regulation service category is not found')
      }
    }

    if (data.country_id) {
      const country = await Country.find(data.country_id)

      if (!country) {
        throw new UnprocessableEntityException('country is not found')
      }
    }

    const image = request.file('image', {
      size: '1mb',
      extnames: ['jpg', 'jpeg', 'png', 'webp'],
    })

    if (image) {
      if (image.errors.length) {
        throw new UnprocessableEntityException('image validation failed', image.errors)
      }
      const subfolder = 'regulation-service-image'
      await image.moveToDisk(subfolder)

      const serverBaseUrl = Env.get('SERVER_BASEURL')
      const path = await Drive.getUrl(`${subfolder}/${image.fileName}`)

      const url = serverBaseUrl + path

      const fileUpload = await FileUpload.find(regService.imageId)

      if (!fileUpload) {
        const fileUpload = await FileUpload.create({
          name: `${subfolder}/${image.fileName}`,
          extname: image.extname,
          type: image.type,
          size: image.size,
          path,
          url,
        })

        regService.imageId = fileUpload.id
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

    if (typeof data.is_published === 'string') {
      data.is_published = data.is_published === 'true'
    }

    regService.merge(data)
    await regService.save()

    await regService.load('category')
    await regService.load('country')
    await regService.load('image')

    return regService
  }

  public async destroy({ params, bouncer }: HttpContextContract) {
    await bouncer.with('RegulationServicePolicy').authorize('delete')

    const regServiceCategory = await RegulationService.find(params.id)

    if (!regServiceCategory) {
      throw new NotFoundException('regulation service is not found')
    }

    await regServiceCategory.delete()

    return {
      message: `SUCCESS: regulation service deleted`,
      code: 'SUCCESS',
    }
  }
}
