import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import NotFoundException from 'App/Exceptions/NotFoundException'
import Product from 'App/Models/Product'
import ProductSpecification from 'App/Models/ProductSpecification'
import CreateProductSpecificationValidator from 'App/Validators/CreateProductSpecificationValidator'
import UpdateProductSpecificationValidator from 'App/Validators/UpdateProductSpecificationValidator'

export default class ProductSpecificationsController {
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

    await bouncer.with('ProductSpecificationPolicy').authorize('viewList', product)

    const page = request.input('page', 1)
    const limit = request.input('limit', 10)

    const productSpecifications = await ProductSpecification.query()
      .where('productId', product.id)
      .preload('product')
      .paginate(page, limit)

    productSpecifications.baseUrl(`/products/${idOrSlug}/specifications`)

    return productSpecifications
  }

  public async store({ request, bouncer }: HttpContextContract) {
    await request.validate(CreateProductSpecificationValidator)

    const idOrSlug = request.param('product_id')

    const product = await Product.query()
      .where('id', idOrSlug)
      .orWhere('slug', idOrSlug)
      .preload('manufacturer')
      .first()

    if (!product) {
      throw new NotFoundException('Product is not found')
    }

    await bouncer.with('ProductSpecificationPolicy').authorize('create', product)

    const productSpecification = new ProductSpecification()
    productSpecification.productId = product.id
    productSpecification.name = request.input('name')
    productSpecification.value = request.input('value')

    await productSpecification.save()

    await productSpecification.load('product')

    return productSpecification
  }

  public async update({ request, bouncer }: HttpContextContract) {
    await request.validate(UpdateProductSpecificationValidator)

    const idOrSlug = request.param('product_id')

    const product = await Product.query()
      .where('id', idOrSlug)
      .orWhere('slug', idOrSlug)
      .preload('manufacturer')
      .first()

    if (!product) {
      throw new NotFoundException('Product is not found')
    }

    await bouncer.with('ProductSpecificationPolicy').authorize('update', product)

    const productSpecificationId = request.param('id')

    const productSpecification = await ProductSpecification.query()
      .where('id', productSpecificationId)
      .andWhere('productId', product.id)
      .first()

    if (!productSpecification) {
      throw new NotFoundException('Product Specification is not found')
    }

    productSpecification.name = request.input('name')
    productSpecification.value = request.input('value')

    await productSpecification.save()

    await productSpecification.refresh()

    return productSpecification
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

    await bouncer.with('ProductSpecificationPolicy').authorize('delete', product)

    const productSpecificationId = request.param('id')

    const productSpecification = await ProductSpecification.query()
      .where('id', productSpecificationId)
      .andWhere('productId', product.id)
      .first()

    if (!productSpecification) {
      throw new NotFoundException('Product Specification is not found')
    }

    await productSpecification.delete()

    return {
      message: `SUCCESS: Product Specification deleted`,
      code: 'SUCCESS',
    }
  }
}
