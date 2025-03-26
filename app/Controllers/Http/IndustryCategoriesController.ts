import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import NotFoundException from 'App/Exceptions/NotFoundException'
import IndustryCategory from 'App/Models/IndustryCategory'
import CreateIndustryCategoryValidator from 'App/Validators/IndustryCategory/CreateIndustryCategoryValidator'
import UpdateIndustryCategoryValidator from 'App/Validators/IndustryCategory/UpdateIndustryCategoryValidator'

export default class IndustryCategoriesController {
  public async index({ request }: HttpContextContract) {
    const page = request.input('page', 1)
    const limit = request.input('limit', 10)

    const industryCategories = await IndustryCategory.query().paginate(page, limit)

    industryCategories.baseUrl('/industry-categories')

    return industryCategories
  }

  public async show({ params }: HttpContextContract) {
    const id = params.id
    const industryCategory = await IndustryCategory.query().where('id', id).first()

    if (!industryCategory) {
      throw new NotFoundException('industryCategory is not found')
    }

    return industryCategory
  }

  public async store({ request, bouncer }: HttpContextContract) {
    await bouncer.with('IndustryCategoryPolicy').authorize('create')

    await request.validate(CreateIndustryCategoryValidator)

    const data = request.only(['name'])

    const industryCategory = new IndustryCategory()

    industryCategory.name = data.name

    await industryCategory.save()

    return industryCategory
  }

  public async update({ params, request, bouncer }: HttpContextContract) {
    await bouncer.with('IndustryCategoryPolicy').authorize('update')

    await request.validate(UpdateIndustryCategoryValidator)

    const id = params.id

    const industryCategory = await IndustryCategory.query().where('id', id).first()

    if (!industryCategory) {
      throw new NotFoundException('industryCategory is not found')
    }

    industryCategory.name = request.input('name')

    await industryCategory.save()

    return industryCategory
  }

  public async destroy({ params, bouncer }: HttpContextContract) {
    const industryCategory = await IndustryCategory.find(params.id)

    if (!industryCategory) {
      throw new NotFoundException('industry category is not found')
    }

    await bouncer.with('IndustryCategoryPolicy').authorize('delete')

    await industryCategory.delete()

    return {
      message: `SUCCESS: industry category deleted`,
      code: 'SUCCESS',
    }
  }
}
