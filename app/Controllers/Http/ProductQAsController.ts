import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import NotFoundException from 'App/Exceptions/NotFoundException'
import Product from 'App/Models/Product'
import ProductQA from 'App/Models/ProductQA'
import CreateProductQAValidator from 'App/Validators/CreateProductQAValidator'
import UpdateProductQAValidator from 'App/Validators/UpdateProductQAValidator'

export default class ProductQAsController {
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

    await bouncer.with('ProductQAPolicy').authorize('viewList', product)

    const page = request.input('page', 1)
    const limit = request.input('limit', 10)

    const productQAs = await ProductQA.query()
      .where('productId', product.id)
      .preload('product')
      .paginate(page, limit)

    productQAs.baseUrl(`/products/${idOrSlug}/question-answers`)

    return productQAs
  }

  public async store({ request, bouncer }: HttpContextContract) {
    await request.validate(CreateProductQAValidator)

    const idOrSlug = request.param('product_id')

    const product = await Product.query()
      .where('id', idOrSlug)
      .orWhere('slug', idOrSlug)
      .preload('manufacturer')
      .first()

    if (!product) {
      throw new NotFoundException('Product is not found')
    }

    await bouncer.with('ProductQAPolicy').authorize('create', product)

    const productQA = new ProductQA()
    productQA.productId = product.id
    productQA.question = request.input('question')
    productQA.answer = request.input('answer')

    await productQA.save()

    await productQA.load('product')

    return productQA
  }

  public async update({ request, bouncer }: HttpContextContract) {
    await request.validate(UpdateProductQAValidator)
    const idOrSlug = request.param('product_id')

    const product = await Product.query()
      .where('id', idOrSlug)
      .orWhere('slug', idOrSlug)
      .preload('manufacturer')
      .first()

    if (!product) {
      throw new NotFoundException('Product is not found')
    }

    await bouncer.with('ProductQAPolicy').authorize('update', product)

    const productQAId = request.param('id')

    const productQA = await ProductQA.query()
      .where('id', productQAId)
      .andWhere('productId', product.id)
      .preload('product', (loader) => {
        loader.preload('manufacturer')
      })
      .first()

    if (!productQA) {
      throw new NotFoundException('Product Question Answer is not found')
    }

    productQA.question = request.input('question')
    productQA.answer = request.input('answer')

    await productQA.save()

    await productQA.refresh()

    return productQA
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
    const productQAId = request.param('id')

    const productQA = await ProductQA.query()
      .where('id', productQAId)
      .andWhere('productId', product.id)
      .first()

    await bouncer.with('ProductQAPolicy').authorize('delete', product)

    if (!productQA) {
      throw new NotFoundException('Product Question Answer is not found')
    }

    await productQA.delete()

    return {
      message: `SUCCESS: Product Question Answer deleted`,
      code: 'SUCCESS',
    }
  }
}
