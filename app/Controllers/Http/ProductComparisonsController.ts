import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import NotFoundException from 'App/Exceptions/NotFoundException'
import UnprocessableEntityException from 'App/Exceptions/UnprocessableEntityException'
import Product from 'App/Models/Product'
import ProductComparison from 'App/Models/ProductComparison'
import ProductCompSpec from 'App/Models/ProductCompSpec'
import ProductSpecification from 'App/Models/ProductSpecification'
import CreateProductComparisonValidator from 'App/Validators/Product/ProductComparison/Create'

export type CreateSpecInput = {
  origin_spec_id: number
  comp_spec_id: number
}

export function isExist(newProductCompSpecs: Partial<ProductCompSpec>[], search: CreateSpecInput) {
  const index = newProductCompSpecs.findIndex(
    (spec) => spec.originSpecId === search.origin_spec_id || spec.compSpecId === search.comp_spec_id
  )

  if (index > -1) return true
  return false
}

export default class ProductComparisonsController {
  public async index({ bouncer, request }: HttpContextContract) {
    const page = request.input('page', 1)
    const limit = request.input('limit', 10)

    const idOrSlug = request.param('product_id')

    const product = await Product.query()
      .where('id', idOrSlug)
      .orWhere('slug', idOrSlug)
      .preload('manufacturer')
      .first()

    if (!product) {
      throw new NotFoundException('Product is not found')
    }

    await bouncer.with('ProductComparisonPolicy').authorize('viewList', product)

    const productComparisons = await ProductComparison.query()
      .preload('product', (product) => {
        product.preload('thumbnail')
      })
      .preload('compProduct')
      .preload('specs', (spec) => {
        spec.preload('originSpec')
        spec.preload('compSpec')
      })
      .paginate(page, limit)

    productComparisons.baseUrl(`/products/${idOrSlug}/comparisons`)

    return productComparisons
  }

  public async store({ request, bouncer }: HttpContextContract) {
    await request.validate(CreateProductComparisonValidator)

    const idOrSlug = request.param('product_id')

    const product = await Product.query()
      .where('id', idOrSlug)
      .orWhere('slug', idOrSlug)
      .preload('manufacturer')
      .first()

    if (!product) {
      throw new NotFoundException('Product is not found')
    }

    await bouncer.with('ProductComparisonPolicy').authorize('create', product)

    const compProductId = request.input('comp_product_id')

    if (Number(idOrSlug) === Number(compProductId)) {
      throw new UnprocessableEntityException('Compared product id cannot be same with product id')
    }

    const compProduct = await Product.find(compProductId)

    if (!compProduct) {
      throw new NotFoundException('Compared product is not found')
    }

    let exist = await ProductComparison.query()
      .where('productId', idOrSlug)
      .andWhere('compProductId', compProductId)
      .first()

    if (exist) {
      throw new UnprocessableEntityException('Product comparison already exists')
    }

    const newProdCompSpecs: Partial<ProductCompSpec>[] = []
    const inputSpecs: CreateSpecInput[] = request.input('specs')

    for (const inputSpec of inputSpecs) {
      if (!isExist(newProdCompSpecs, inputSpec)) {
        const originSpec = await ProductSpecification.query()
          .where('id', inputSpec.origin_spec_id)
          .andWhere('productId', product.id)
          .first()

        if (!originSpec) {
          throw new UnprocessableEntityException(
            `origin spec with id ${inputSpec.origin_spec_id} is not found`
          )
        }

        const compSpec = await ProductSpecification.query()
          .where('id', inputSpec.comp_spec_id)
          .andWhere('productId', compProductId)
          .first()

        if (!compSpec) {
          throw new UnprocessableEntityException(
            `comp spec with id ${inputSpec.comp_spec_id} is not found`
          )
        }

        newProdCompSpecs.push({
          productComparisonId: 0,
          originSpecId: inputSpec.origin_spec_id,
          compSpecId: inputSpec.comp_spec_id,
        })
      } else {
        throw new UnprocessableEntityException('There is duplicate specs')
      }
    }

    const productComparison = new ProductComparison()
    productComparison.productId = product.id
    productComparison.compProductId = compProductId

    await productComparison.save()

    newProdCompSpecs.forEach(
      (_, i) => (newProdCompSpecs[i].productComparisonId = productComparison.id)
    )

    await ProductCompSpec.createMany(newProdCompSpecs)

    await productComparison.load('product', (product) => {
      product.preload('thumbnail')
    })
    await productComparison.load('specs', (specs) => {
      specs.preload('originSpec')
      specs.preload('compSpec')
    })

    return productComparison
  }

  public async update({ request, bouncer }: HttpContextContract) {
    await request.validate(CreateProductComparisonValidator)

    const idOrSlug = request.param('product_id')

    const product = await Product.query()
      .where('id', idOrSlug)
      .orWhere('slug', idOrSlug)
      .preload('manufacturer')
      .first()

    if (!product) {
      throw new NotFoundException('Product is not found')
    }

    await bouncer.with('ProductComparisonPolicy').authorize('update', product)

    const productComparisonId = request.param('id')
    const compProductId = request.input('comp_product_id')

    if (Number(product.id) === Number(compProductId)) {
      throw new UnprocessableEntityException('Compared product id cannot be same with product id')
    }

    const compProduct = await Product.find(compProductId)

    if (!compProduct) {
      throw new NotFoundException('Compared product is not found')
    }

    const productComparison = await ProductComparison.query()
      .where('id', productComparisonId)
      .andWhere('productId', product.id)
      .first()

    if (!productComparison) {
      throw new NotFoundException('Product comparison is not found')
    }

    if (productComparison.compProductId !== Number(compProductId)) {
      // make sure there is no duplicate compared product
      const exist = await ProductComparison.query()
        .where('productId', product.id)
        .andWhere('compProductId', compProductId)
        .first()

      if (exist) {
        throw new UnprocessableEntityException('Product comparison already exists')
      }
    }

    await ProductCompSpec.query().where('productComparisonId', productComparison.id).delete()

    const newProdCompSpecs: Partial<ProductCompSpec>[] = []
    const inputSpecs: CreateSpecInput[] = request.input('specs')

    for (const inputSpec of inputSpecs) {
      if (!isExist(newProdCompSpecs, inputSpec)) {
        const originSpec = await ProductSpecification.query()
          .where('id', inputSpec.origin_spec_id)
          .andWhere('productId', product.id)
          .first()

        if (!originSpec) {
          throw new UnprocessableEntityException(
            `origin spec with id ${inputSpec.origin_spec_id} is not found`
          )
        }

        const compSpec = await ProductSpecification.query()
          .where('id', inputSpec.comp_spec_id)
          .andWhere('productId', compProductId)
          .first()

        if (!compSpec) {
          throw new UnprocessableEntityException(
            `comp spec with id ${inputSpec.comp_spec_id} is not found`
          )
        }

        newProdCompSpecs.push({
          productComparisonId: 0,
          originSpecId: inputSpec.origin_spec_id,
          compSpecId: inputSpec.comp_spec_id,
        })
      } else {
        throw new UnprocessableEntityException('There is duplicate specs')
      }
    }

    productComparison.productId = product.id
    productComparison.compProductId = compProductId

    await productComparison.save()

    newProdCompSpecs.forEach(
      (_, i) => (newProdCompSpecs[i].productComparisonId = productComparisonId)
    )

    await ProductCompSpec.createMany(newProdCompSpecs)

    await productComparison.load('product', (product) => {
      product.preload('thumbnail')
    })
    await productComparison.load('specs', (specs) => {
      specs.preload('originSpec')
      specs.preload('compSpec')
    })

    return productComparison
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

    await bouncer.with('ProductComparisonPolicy').authorize('delete', product)

    const productComparisonId = request.param('id')

    const productComparison = await ProductComparison.query()
      .where('id', productComparisonId)
      .andWhere('productId', product.id)
      .first()

    if (!productComparison) {
      throw new NotFoundException('Product Comparison is not found')
    }

    await productComparison.delete()

    return {
      message: `SUCCESS: Product Comparison deleted`,
      code: 'SUCCESS',
    }
  }
}
