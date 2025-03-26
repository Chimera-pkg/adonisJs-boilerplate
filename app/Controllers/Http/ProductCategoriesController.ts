import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import NotFoundException from 'App/Exceptions/NotFoundException'
import ProductCategory from 'App/Models/ProductCategory'
import CreateProductCategoryValidator from 'App/Validators/ProductCategory/CreateProductCategoryValidator'
import UpdateProductCategoryValidator from 'App/Validators/ProductCategory/UpdateProductCategoryValidator'

export default class ProductCategoriesController {
  public async index({ request }: HttpContextContract) {
    const page = request.input('page', 1)
    const limit = request.input('limit', 10)

    const productCategory = await ProductCategory.query().paginate(page, limit)

    productCategory.baseUrl('/product-categories')

    return productCategory
  }

  public async show({ params }: HttpContextContract) {
    const id = params.id
    const productCategory = await ProductCategory.query().where('id', id).first()

    if (!productCategory) {
      throw new NotFoundException('product category is not found')
    }

    return productCategory
  }

  public async store({ request, bouncer }: HttpContextContract) {
    await bouncer.with('ProductCategoryPolicy').authorize('create')

    await request.validate(CreateProductCategoryValidator)

    const data = request.only(['name'])

    const productCategory = new ProductCategory()

    productCategory.name = data.name

    await productCategory.save()

    return productCategory
  }

  public async update({ params, request, bouncer }: HttpContextContract) {
    await bouncer.with('ProductCategoryPolicy').authorize('update')

    await request.validate(UpdateProductCategoryValidator)

    const id = params.id

    const productCategory = await ProductCategory.query().where('id', id).first()

    if (!productCategory) {
      throw new NotFoundException('product category is not found')
    }

    productCategory.name = request.input('name')

    await productCategory.save()

    return productCategory
  }

  public async destroy({ params, bouncer }: HttpContextContract) {
    const productCategory = await ProductCategory.find(params.id)

    if (!productCategory) {
      throw new NotFoundException('product category is not found')
    }

    await bouncer.with('ProductCategoryPolicy').authorize('delete')

    await productCategory.delete()

    return {
      message: `SUCCESS: product category deleted`,
      code: 'SUCCESS',
    }
  }
}
