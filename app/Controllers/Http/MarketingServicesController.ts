import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Drive from '@ioc:Adonis/Core/Drive'
import Env from '@ioc:Adonis/Core/Env'
import NotFoundException from 'App/Exceptions/NotFoundException'
import UnprocessableEntityException from 'App/Exceptions/UnprocessableEntityException'
import Country from 'App/Models/Country'
import FileUpload from 'App/Models/FileUpload'
import MarketingService from 'App/Models/MarketingService'
import MarketingServiceCategory from 'App/Models/MarketingServiceCategory'
import UpdateMarketingServiceCategoryValidator from 'App/Validators/MarketingService/Category/UpdateMarketingServiceCategoryValidator'
import CreateMarketingServiceValidator from 'App/Validators/MarketingService/CreateMarketingServiceValidator'

export default class MarketingServicesController {
  public async index({ request, auth }: HttpContextContract) {
    const page = request.input('page', 1)
    const limit = request.input('limit', 10)
    const categoryIdsStr: string = request.input('category_ids')
    const countryIdsStr: string = request.input('country_ids')

    const marketingServicesQuery = MarketingService.query()
      .withScopes((scopes) => scopes.visibleTo(auth.user))
      .preload('category')
      .preload('country')
      .preload('image')

    if (categoryIdsStr) {
      const categoryIds = categoryIdsStr.split(',')

      marketingServicesQuery.whereIn('categoryId', categoryIds)
    }

    if (countryIdsStr) {
      const countryIds = countryIdsStr.split(',')
      marketingServicesQuery.whereIn('countryId', countryIds)
    }

    const marketingServices = await marketingServicesQuery.paginate(page, limit)

    marketingServices.baseUrl('/marketing-services')

    return marketingServices
  }

  public async show({ params, bouncer }: HttpContextContract) {
    const marketingService = await MarketingService.find(params.id)

    if (!marketingService) {
      throw new NotFoundException('marketing service is not found')
    }

    await bouncer.with('MarketingServicePolicy').authorize('view', marketingService)

    await marketingService.load('category')
    await marketingService.load('country')
    await marketingService.load('image')

    return marketingService
  }

  public async store({ request, bouncer }) {
    await bouncer.with('MarketingServicePolicy').authorize('create')

    await request.validate(CreateMarketingServiceValidator)

    const data = request.only(['title', 'content', 'is_published', 'country_id', 'category_id'])

    const marketingServiceCategory = await MarketingServiceCategory.find(data.category_id)

    if (!marketingServiceCategory) {
      throw new UnprocessableEntityException('marketing service category is not found')
    }

    const country = await Country.find(data.country_id)

    if (!country) {
      throw new UnprocessableEntityException('country is not found')
    }

    if (typeof data.is_published === 'string') {
      data.is_published = data.is_published === 'true'
    }

    const marketingService = await MarketingService.create(data)

    const image = request.file('image')
    if (image) {
      const fileUpload = new FileUpload()

      const subfolder = 'marketing-service-image'

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

      await marketingService.related('image').associate(fileUpload)
    }

    await marketingService.load('category')
    await marketingService.load('country')
    await marketingService.load('image')

    return marketingService
  }

  public async update({ params, request, bouncer }) {
    await bouncer.with('MarketingServicePolicy').authorize('update')

    await request.validate(UpdateMarketingServiceCategoryValidator)

    const marketingService = await MarketingService.find(params.id)

    if (!marketingService) {
      throw new NotFoundException('marketing service category is not found')
    }

    const data = request.only(['title', 'content', 'is_published', 'country_id', 'category_id'])

    if (data.category_id) {
      const marketingServiceCategory = await MarketingServiceCategory.find(data.category_id)

      if (!marketingServiceCategory) {
        throw new UnprocessableEntityException('marketing service category is not found')
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
      const subfolder = 'marketing-service-image'
      await image.moveToDisk(subfolder)

      const serverBaseUrl = Env.get('SERVER_BASEURL')
      const path = await Drive.getUrl(`${subfolder}/${image.fileName}`)

      const url = serverBaseUrl + path

      const fileUpload = await FileUpload.find(marketingService.imageId)

      if (!fileUpload) {
        const fileUpload = await FileUpload.create({
          name: `${subfolder}/${image.fileName}`,
          extname: image.extname,
          type: image.type,
          size: image.size,
          path,
          url,
        })

        marketingService.imageId = fileUpload.id
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

    marketingService.merge(data)
    await marketingService.save()

    await marketingService.load('category')
    await marketingService.load('country')
    await marketingService.load('image')

    return marketingService
  }

  public async destroy({ params, bouncer }: HttpContextContract) {
    await bouncer.with('MarketingServicePolicy').authorize('delete')

    const marketingServiceCategory = await MarketingService.find(params.id)

    if (!marketingServiceCategory) {
      throw new NotFoundException('marketing service is not found')
    }

    await marketingServiceCategory.delete()

    return {
      message: `SUCCESS: marketing service deleted`,
      code: 'SUCCESS',
    }
  }
}
