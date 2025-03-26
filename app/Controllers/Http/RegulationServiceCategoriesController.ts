import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import NotFoundException from 'App/Exceptions/NotFoundException'
import RegulationServiceCategory from 'App/Models/RegulationServiceCategory'
import CreateRegServiceCategoryValidator from 'App/Validators/RegulationService/Category/CreateRegServiceCategoryValidator'
import UpdateRegServiceCategoryValidator from 'App/Validators/RegulationService/Category/UpdateRegServiceCategoryValidator'

export default class RegulationServiceCategoriesController {
  public async index({ request }: HttpContextContract) {
    const page = request.input('page', 1)
    const limit = request.input('limit', 10)

    const regServiceCategories = await RegulationServiceCategory.query().paginate(page, limit)

    regServiceCategories.baseUrl('/regulation-service-categories')

    return regServiceCategories
  }

  public async show({ params }: HttpContextContract) {
    const regServiceCategory = await RegulationServiceCategory.find(params.id)

    if (!regServiceCategory) {
      throw new NotFoundException('regulation service category is not found')
    }

    return regServiceCategory
  }

  public async store({ request, bouncer }: HttpContextContract) {
    await bouncer.with('RegulationServiceCategoryPolicy').authorize('create')

    await request.validate(CreateRegServiceCategoryValidator)

    const data = request.only(['name', 'description'])

    const regServiceCategory = await RegulationServiceCategory.create(data)

    return regServiceCategory
  }

  public async update({ params, request, bouncer }: HttpContextContract) {
    await bouncer.with('RegulationServiceCategoryPolicy').authorize('update')

    await request.validate(UpdateRegServiceCategoryValidator)

    const regServiceCategory = await RegulationServiceCategory.find(params.id)

    if (!regServiceCategory) {
      throw new NotFoundException('regulation service category is not found')
    }

    const data = request.only(['name', 'description'])

    regServiceCategory.merge(data)
    await regServiceCategory.save()

    return regServiceCategory
  }

  public async destroy({ params, bouncer }: HttpContextContract) {
    await bouncer.with('RegulationServiceCategoryPolicy').authorize('delete')

    const regServiceCategory = await RegulationServiceCategory.find(params.id)

    if (!regServiceCategory) {
      throw new NotFoundException('regulation service category is not found')
    }

    await regServiceCategory.delete()

    return {
      message: `SUCCESS: regulation service category deleted`,
      code: 'SUCCESS',
    }
  }
}
