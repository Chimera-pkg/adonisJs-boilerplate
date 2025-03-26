import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import NotFoundException from 'App/Exceptions/NotFoundException'
import MarketingServiceCategory from 'App/Models/MarketingServiceCategory'
import CreateMarketingServiceCategoryValidator from 'App/Validators/MarketingService/Category/CreateMarketingServiceCategoryValidator'
import UpdateMarketingServiceCategoryValidator from 'App/Validators/MarketingService/Category/UpdateMarketingServiceCategoryValidator'

export default class MarketingServiceCategoriesController {
  public async index({ request }: HttpContextContract) {
    const page = request.input('page', 1)
    const limit = request.input('limit', 10)

    const marketingServiceCategories = await MarketingServiceCategory.query().paginate(page, limit)

    marketingServiceCategories.baseUrl('/marketing-service-categories')

    return marketingServiceCategories
  }

  public async show({ params }: HttpContextContract) {
    const marketingServiceCategory = await MarketingServiceCategory.find(params.id)

    if (!marketingServiceCategory) {
      throw new NotFoundException('marketing service category is not found')
    }

    return marketingServiceCategory
  }

  public async store({ request, bouncer }: HttpContextContract) {
    await bouncer.with('MarketingServiceCategoryPolicy').authorize('create')

    await request.validate(CreateMarketingServiceCategoryValidator)

    const data = request.only(['name', 'description'])

    const marketingServiceCategory = await MarketingServiceCategory.create(data)

    return marketingServiceCategory
  }

  public async update({ params, request, bouncer }: HttpContextContract) {
    await bouncer.with('MarketingServiceCategoryPolicy').authorize('update')

    await request.validate(UpdateMarketingServiceCategoryValidator)

    const marketingServiceCategory = await MarketingServiceCategory.find(params.id)

    if (!marketingServiceCategory) {
      throw new NotFoundException('marketing service category is not found')
    }

    const data = request.only(['name', 'description'])

    marketingServiceCategory.merge(data)
    await marketingServiceCategory.save()

    return marketingServiceCategory
  }

  public async destroy({ params, bouncer }: HttpContextContract) {
    await bouncer.with('MarketingServiceCategoryPolicy').authorize('delete')

    const marketingServiceCategory = await MarketingServiceCategory.find(params.id)

    if (!marketingServiceCategory) {
      throw new NotFoundException('marketing service category is not found')
    }

    await marketingServiceCategory.delete()

    return {
      message: `SUCCESS: marketing service category deleted`,
      code: 'SUCCESS',
    }
  }
}
