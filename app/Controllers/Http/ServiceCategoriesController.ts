import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import NotFoundException from 'App/Exceptions/NotFoundException'
import ServiceCategory from 'App/Models/ServiceCategory'
import CreateServiceCategoryValidator from 'App/Validators/ServiceCategory/CreateServiceCategoryValidator'
import UpdateServiceCategoryValidator from 'App/Validators/ServiceCategory/UpdateServiceCategoryValidator'

export default class ServiceCategoriesController {
  public async index({ request }: HttpContextContract) {
    const page = request.input('page', 1)
    const limit = request.input('limit', 10)

    const serviceCategory = await ServiceCategory.query().paginate(page, limit)

    serviceCategory.baseUrl('/service-categories')

    return serviceCategory
  }

  public async show({ params }: HttpContextContract) {
    const id = params.id
    const serviceCategory = await ServiceCategory.query().where('id', id).first()

    if (!serviceCategory) {
      throw new NotFoundException('service category is not found')
    }

    return serviceCategory
  }

  public async store({ request, bouncer }: HttpContextContract) {
    await bouncer.with('ServiceCategoryPolicy').authorize('create')

    await request.validate(CreateServiceCategoryValidator)

    const data = request.only(['name'])

    const serviceCategory = new ServiceCategory()

    serviceCategory.name = data.name

    await serviceCategory.save()

    return serviceCategory
  }

  public async update({ params, request, bouncer }: HttpContextContract) {
    await bouncer.with('ServiceCategoryPolicy').authorize('update')

    await request.validate(UpdateServiceCategoryValidator)

    const id = params.id

    const serviceCategory = await ServiceCategory.query().where('id', id).first()

    if (!serviceCategory) {
      throw new NotFoundException('service category is not found')
    }

    serviceCategory.name = request.input('name')

    await serviceCategory.save()

    return serviceCategory
  }

  public async destroy({ params, bouncer }: HttpContextContract) {
    const serviceCategory = await ServiceCategory.find(params.id)

    if (!serviceCategory) {
      throw new NotFoundException('service category is not found')
    }

    await bouncer.with('ServiceCategoryPolicy').authorize('delete')

    await serviceCategory.delete()

    return {
      message: `SUCCESS: service category deleted`,
      code: 'SUCCESS',
    }
  }
}
