import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Drive from '@ioc:Adonis/Core/Drive'
import Env from '@ioc:Adonis/Core/Env'
import NotFoundException from 'App/Exceptions/NotFoundException'
import FileUpload from 'App/Models/FileUpload'
import Product from 'App/Models/Product'
import ProductUserManual from 'App/Models/ProductUserManual'
import CreateProductUserManualValidator from 'App/Validators/CreateProductUserManualValidator'

export default class ProductUserManualsController {
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

    await bouncer.with('ProductUserManualPolicy').authorize('viewList', product)

    const page = request.input('page', 1)
    const limit = request.input('limit', 10)

    const productUserManuals = await ProductUserManual.query()
      .where('productId', product.id)
      .preload('file')
      .preload('product')
      .paginate(page, limit)

    productUserManuals.baseUrl(`/products/${idOrSlug}/user-manuals`)

    return productUserManuals
  }

  public async store({ request, bouncer }) {
    await request.validate(CreateProductUserManualValidator)
    const idOrSlug = request.param('product_id')

    const product = await Product.query()
      .where('id', idOrSlug)
      .orWhere('slug', idOrSlug)
      .preload('manufacturer')
      .first()

    if (!product) {
      throw new NotFoundException('Product is not found')
    }

    await bouncer.with('ProductUserManualPolicy').authorize('create', product)

    const file = request.file('file')

    const subfolder = 'product-user-manual'
    await file.moveToDisk(subfolder)

    const serverBaseUrl = Env.get('SERVER_BASEURL')
    const path = await Drive.getUrl(`${subfolder}/${file.fileName}`)

    const url = serverBaseUrl + path

    const fileUpload = await FileUpload.create({
      name: `${subfolder}/${file.fileName}`,
      extname: file.extname,
      type: file.type,
      size: file.size,
      path,
      url,
    })

    const productUserManual = new ProductUserManual()
    productUserManual.fileId = fileUpload.id
    productUserManual.productId = product.id

    await productUserManual.save()

    await productUserManual.load('file')
    await productUserManual.load('product')

    return productUserManual
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

    await bouncer.with('ProductUserManualPolicy').authorize('delete', product)

    const productUserManualId = request.param('id')

    const productUserManual = await ProductUserManual.query()
      .where('id', productUserManualId)
      .andWhere('productId', product.id)
      .first()

    if (!productUserManual) {
      throw new NotFoundException('Product user manual is not found')
    }

    await productUserManual.load('file')

    await Drive.delete(productUserManual.file.name)

    await productUserManual.delete()

    return {
      message: `SUCCESS: Product user manual deleted`,
      code: 'SUCCESS',
    }
  }
}
