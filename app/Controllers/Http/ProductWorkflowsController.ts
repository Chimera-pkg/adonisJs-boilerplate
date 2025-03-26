import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import NotFoundException from 'App/Exceptions/NotFoundException'
import UnprocessableEntityException from 'App/Exceptions/UnprocessableEntityException'
import Product from 'App/Models/Product'
import ProductWorkflow from 'App/Models/ProductWorkflow'
import CreateProductWorkflowValidator from 'App/Validators/CreateProductWorkflowValidator'
import UpdateProductWorkflowValidator from 'App/Validators/UpdateProductWorkflowValidator'

export default class ProductWorkflowsController {
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

    await bouncer.with('ProductWorkflowPolicy').authorize('viewList', product)

    const page = request.input('page', 1)
    const limit = request.input('limit', 10)

    const productWorkflows = await ProductWorkflow.query()
      .where('productId', product.id)
      .preload('product')
      .paginate(page, limit)

    productWorkflows.baseUrl(`/products/${idOrSlug}/workflows`)

    return productWorkflows
  }

  public async store({ request, bouncer }: HttpContextContract) {
    await request.validate(CreateProductWorkflowValidator)

    const idOrSlug = request.param('product_id')

    const product = await Product.query()
      .where('id', idOrSlug)
      .orWhere('slug', idOrSlug)
      .preload('manufacturer')
      .first()

    if (!product) {
      throw new NotFoundException('Product is not found')
    }

    await bouncer.with('ProductWorkflowPolicy').authorize('create', product)

    const seq = request.input('seq')

    let productWorkflow = await ProductWorkflow.query()
      .where('productId', product.id)
      .andWhere('seq', seq)
      .first()

    if (productWorkflow) {
      throw new UnprocessableEntityException('Product workflow seq already exists')
    }

    productWorkflow = new ProductWorkflow()
    productWorkflow.productId = product.id
    productWorkflow.seq = seq
    productWorkflow.title = request.input('title')
    productWorkflow.description = request.input('description')

    await productWorkflow.save()

    await productWorkflow.load('product')

    return productWorkflow
  }

  public async update({ request, bouncer }: HttpContextContract) {
    await request.validate(UpdateProductWorkflowValidator)
    const idOrSlug = request.param('product_id')

    const product = await Product.query()
      .where('id', idOrSlug)
      .orWhere('slug', idOrSlug)
      .preload('manufacturer')
      .first()

    if (!product) {
      throw new NotFoundException('Product is not found')
    }

    await bouncer.with('ProductWorkflowPolicy').authorize('update', product)

    const productWorkflowId = request.param('id')

    const productWorkflow = await ProductWorkflow.query()
      .where('id', productWorkflowId)
      .andWhere('productId', product.id)
      .preload('product', (loader) => {
        loader.preload('manufacturer')
      })
      .first()

    if (!productWorkflow) {
      throw new NotFoundException('Product Workflow is not found')
    }

    const seq = request.input('seq')
    const title = request.input('title')
    const description = request.input('description')

    if (Number(seq) !== productWorkflow.seq) {
      const anotherProductWorkflow = await ProductWorkflow.query()
        .where('productId', product.id)
        .andWhere('seq', seq)
        .first()

      if (anotherProductWorkflow) {
        throw new UnprocessableEntityException('Product workflow seq already exists')
      }
    }

    if (seq) {
      productWorkflow.seq = seq
    }

    if (title) {
      productWorkflow.title = title
    }

    if (description) {
      productWorkflow.description = description
    }

    await productWorkflow.save()

    await productWorkflow.refresh()

    return productWorkflow
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

    await bouncer.with('ProductWorkflowPolicy').authorize('delete', product)

    const productWorkflowId = request.param('id')

    const productWorkflow = await ProductWorkflow.query()
      .where('id', productWorkflowId)
      .andWhere('productId', product.id)
      .first()

    if (!productWorkflow) {
      throw new NotFoundException('Product Workflow is not found')
    }

    await productWorkflow.delete()

    return {
      message: `SUCCESS: Product Workflow deleted`,
      code: 'SUCCESS',
    }
  }
}
