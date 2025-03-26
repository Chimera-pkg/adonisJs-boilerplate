import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Drive from '@ioc:Adonis/Core/Drive'
import Env from '@ioc:Adonis/Core/Env'
import NotFoundException from 'App/Exceptions/NotFoundException'
import Product from 'App/Models/Product'
import ProductMedia, { ProductMediaType } from 'App/Models/ProductMedia'
import UnprocessableEntityException from 'App/Exceptions/UnprocessableEntityException'
import CreateProductMediaValidator from 'App/Validators/Product/ProductMedia/Create'

export default class ProductMediasController {
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

    await bouncer.with('ProductMediaPolicy').authorize('viewList', product)

    const page = request.input('page', 1)
    const limit = request.input('limit', 10)

    const productMedias = await ProductMedia.query()
      .where('productId', product.id)
      .paginate(page, limit)

    productMedias.baseUrl(`/products/${idOrSlug}/media`)

    return productMedias
  }

  public async store({ request, bouncer }) {
    await request.validate(CreateProductMediaValidator)

    const idOrSlug = request.param('product_id')

    const product = await Product.query()
      .where('id', idOrSlug)
      .orWhere('slug', idOrSlug)
      .preload('manufacturer')
      .first()

    if (!product) {
      throw new NotFoundException('Product is not found')
    }

    await bouncer.with('ProductMediaPolicy').authorize('create', product)

    const image = request.file('image')
    const name = request.input('name')
    const inputUrl = request.input('url')
    const type = request.input('type')

    if (type === ProductMediaType.image && !image) {
      throw new UnprocessableEntityException('"image" field is required when type is "image"')
    }

    if (type !== ProductMediaType.image) {
      if (!inputUrl) {
        throw new UnprocessableEntityException(
          '"url" field is required when type is "video" or "3d"'
        )
      }

      if (!name) {
        throw new UnprocessableEntityException(
          '"name" field is required when type is "video" or "3d"'
        )
      }
    }

    const productMedia = new ProductMedia()

    if (type === ProductMediaType.image && image) {
      console.log('image', image)
      const subfolder = 'product-media'
      await image.moveToDisk(subfolder)

      const serverBaseUrl = Env.get('SERVER_BASEURL')
      const path = await Drive.getUrl(`${subfolder}/${image.fileName}`)

      const url = serverBaseUrl + path

      productMedia.name = `${subfolder}/${image.fileName}`
      productMedia.url = url
    } else {
      productMedia.name = name
      productMedia.url = inputUrl
    }

    productMedia.productId = product.id
    productMedia.type = type

    await productMedia.save()

    return productMedia
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

    await bouncer.with('ProductMediaPolicy').authorize('delete', product)

    const productMediaId = request.param('id')

    const productMedia = await ProductMedia.query()
      .where('id', productMediaId)
      .andWhere('productId', product.id)
      .first()

    if (!productMedia) {
      throw new NotFoundException('Product media is not found')
    }

    if (productMedia.type === ProductMediaType.image) {
      await Drive.delete(productMedia.name)
    }

    await productMedia.delete()

    return {
      message: `SUCCESS: Product media deleted`,
      code: 'SUCCESS',
    }
  }
}
