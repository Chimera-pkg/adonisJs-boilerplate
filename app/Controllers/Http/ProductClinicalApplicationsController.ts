import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import NotFoundException from 'App/Exceptions/NotFoundException'
import Product from 'App/Models/Product'
import ProductClinicalApplication from 'App/Models/ProductClinicalApplication'
import CreateProductClinicalApplicationValidator from 'App/Validators/CreateProductClinicalApplicationValidator'
import UpdateProductClinicalApplicationValidator from 'App/Validators/UpdateProductClinicalApplicationValidator'

export default class ProductClinicalApplicationsController {
  public async index({ request, bouncer }: HttpContextContract) {
    const idOrSlug = request.param('product_id')

    const product = await Product.query()
      .where('id', idOrSlug)
      .orWhere('slug', idOrSlug)
      .preload('manufacturer')
      .first()

    if (!product) {
      throw new NotFoundException('Product is not found')
    }

    await bouncer.with('ProductClinicalApplicationPolicy').authorize('viewList', product)

    const page = request.input('page', 1)
    const limit = request.input('limit', 10)

    const productClinicalApplications = await ProductClinicalApplication.query()
      .where('productId', product.id)
      .preload('product')
      .paginate(page, limit)

    productClinicalApplications.baseUrl(`/products/${idOrSlug}/clinical-applications`)

    return productClinicalApplications
  }

  public async store({ request, bouncer }: HttpContextContract) {
    await request.validate(CreateProductClinicalApplicationValidator)

    const idOrSlug = request.param('product_id')

    const product = await Product.query()
      .where('id', idOrSlug)
      .orWhere('slug', idOrSlug)
      .preload('manufacturer')
      .first()

    if (!product) {
      throw new NotFoundException('Product is not found')
    }

    await bouncer.with('ProductClinicalApplicationPolicy').authorize('create', product)

    const productClinicalApplication = new ProductClinicalApplication()
    productClinicalApplication.productId = product.id
    productClinicalApplication.content = request.input('content')

    await productClinicalApplication.save()

    await productClinicalApplication.load('product')

    return productClinicalApplication
  }

  public async update({ request, bouncer }: HttpContextContract) {
    await request.validate(UpdateProductClinicalApplicationValidator)

    const idOrSlug = request.param('product_id')

    const product = await Product.query()
      .where('id', idOrSlug)
      .orWhere('slug', idOrSlug)
      .preload('manufacturer')
      .first()

    if (!product) {
      throw new NotFoundException('Product is not found')
    }

    await bouncer.with('ProductClinicalApplicationPolicy').authorize('update', product)

    const productClinicalApplicationId = request.param('id')

    const productClinicalApplication = await ProductClinicalApplication.query()
      .where('id', productClinicalApplicationId)
      .andWhere('productId', product.id)
      .first()

    if (!productClinicalApplication) {
      throw new NotFoundException('Product Clinical Application is not found')
    }

    productClinicalApplication.content = request.input('content')

    await productClinicalApplication.save()

    await productClinicalApplication.refresh()

    return productClinicalApplication
  }

  public async destroy({ request, bouncer }: HttpContextContract) {
    const idOrSlug = request.param('product_id')

    const product = await Product.query()
      .where('id', idOrSlug)
      .orWhere('slug', idOrSlug)
      .preload('manufacturer')
      .first()

    if (!product) {
      throw new NotFoundException('Product is not found')
    }

    await bouncer.with('ProductClinicalApplicationPolicy').authorize('delete', product)

    const productClinicalApplicationId = request.param('id')

    const productClinicalApplication = await ProductClinicalApplication.query()
      .where('id', productClinicalApplicationId)
      .andWhere('productId', product.id)
      .first()

    if (!productClinicalApplication) {
      throw new NotFoundException('Product Clinical Application is not found')
    }

    await productClinicalApplication.delete()

    return {
      message: `SUCCESS: Product Clinical Application deleted`,
      code: 'SUCCESS',
    }
  }
}
