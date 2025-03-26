import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database'
import Drive from '@ioc:Adonis/Core/Drive'
import Env from '@ioc:Adonis/Core/Env'
import ProductCategory from 'App/Models/ProductCategory'
import Manufacturer from 'App/Models/Manufacturer'
import Product from 'App/Models/Product'
import CreateProductValidator from 'App/Validators/Product/CreateProductValidator'
import FileUpload from 'App/Models/FileUpload'
import NotFoundException from 'App/Exceptions/NotFoundException'
import UpdateProductValidator from 'App/Validators/Product/UpdateProductValidator'
import UnprocessableEntityException from 'App/Exceptions/UnprocessableEntityException'
import ProductSpecification from 'App/Models/ProductSpecification'
import ProductClinicalApplication from 'App/Models/ProductClinicalApplication'
import ProductWorkflow from 'App/Models/ProductWorkflow'
import ProductQA from 'App/Models/ProductQA'
import ProductMedia, { ProductMediaType } from 'App/Models/ProductMedia'
import ProductUserManual from 'App/Models/ProductUserManual'
import Tag from 'App/Models/Tag'
import IndexProductValidator from 'App/Validators/Product/IndexProductValidator'
export default class ProductsController {
  public async index({ bouncer, auth, request }: HttpContextContract) {
    await request.validate(IndexProductValidator)

    const page = request.input('page', 1) || 1
    const limit = request.input('limit', 10) || 10
    const manufacturerId = request.input('manufacturer_id')
    const keyword = request.input('keyword')
    const sort = request.input('sort', 'id')
    const order = request.input('order', 'asc')
    const countryIdsStr = request.input('country_ids', '')
    const categoryIdsStr = request.input('category_ids', '')

    await bouncer.with('ProductPolicy').authorize('viewList')

    let user = auth.user

    if (user) {
      await user.load('manufacturer')
    }

    const productsQuery = Product.query()
      .withScopes((scopes) => scopes.visibleTo(user))
      .preload('category')
      .preload('tags')
      .preload('manufacturer', (manufacturer) => {
        manufacturer.preload('user')
        manufacturer.preload('country')
      })
      .preload('thumbnail')

    if (manufacturerId) {
      productsQuery.where('manufacturerId', manufacturerId)
    }

    if (keyword) {
      productsQuery.where('name', 'like', `%${keyword}%`)
      productsQuery.orWhere('description', 'like', `%${keyword}%`)
    }

    if (sort) {
      productsQuery.orderBy(sort, order)
    }

    if (countryIdsStr) {
      const countryIds: string[] = countryIdsStr.split(',')

      productsQuery.whereHas('manufacturer', (manufacturer) => {
        manufacturer.whereIn('countryId', countryIds)
      })
    }

    if (categoryIdsStr) {
      const categoryIds: string[] = categoryIdsStr.split(',')

      productsQuery.whereIn('categoryId', categoryIds)
    }

    const products = await productsQuery.paginate(page, limit)

    products.baseUrl('/products')

    return products
  }

  public async store({ request, auth, bouncer }) {
    await request.validate(CreateProductValidator)

    await bouncer.with('ProductPolicy').authorize('create')

    const user = await auth.authenticate()

    const categoryId = request.input('category_id')

    const manufacturer = await Manufacturer.findBy('userId', user.id)

    if (!manufacturer) {
      throw new UnprocessableEntityException('manufacturer_id is not found')
    }

    await manufacturer.load('user')

    const category = await ProductCategory.find(categoryId)

    if (!category) {
      throw new UnprocessableEntityException('category_id is not found')
    }

    const trx = await Database.transaction()

    const tags = request.input('tags', '')

    const tagsArray = tags.split(',')
    const tagIds: number[] = []

    for (const tag of tagsArray) {
      let newTag = await Tag.findBy('name', tag)

      if (!newTag) {
        newTag = await Tag.create(
          {
            name: tag,
          },
          { client: trx }
        )
      }

      tagIds.push(newTag.id)
    }

    const product = new Product()

    const thumbnail = request.file('thumbnail')

    let fileUpload

    if (thumbnail) {
      const subfolder = 'product-thumbnail'

      const serverBaseUrl = Env.get('SERVER_BASEURL')

      await thumbnail.moveToDisk(subfolder)

      const path = await Drive.getUrl(`${subfolder}/${thumbnail.fileName}`)

      const url = serverBaseUrl + path

      fileUpload = await FileUpload.create(
        {
          name: `${subfolder}/${thumbnail.fileName}`,
          extname: thumbnail.extname,
          type: thumbnail.type,
          size: thumbnail.size,
          path,
          url,
        },
        { client: trx }
      )

      product.thumbnailId = fileUpload.id
    }

    let isPublished = request.input('is_published')

    if (typeof isPublished === 'string') {
      isPublished = isPublished === 'true'
    }

    product.name = request.input('name')
    product.description = request.input('description')
    product.isPublished = isPublished
    product.categoryId = categoryId
    product.manufacturerId = manufacturer.id

    product.useTransaction(trx)
    await product.save()

    if (tagIds.length > 0) {
      await product.related('tags').attach(tagIds, trx)
    }

    const videos = request.input('videos', [])

    if (videos) {
      for (const video of videos) {
        const productMedia = new ProductMedia()

        productMedia.productId = product.id
        productMedia.type = ProductMediaType.video
        productMedia.name = 'video'
        productMedia.url = video

        productMedia.useTransaction(trx)
        await productMedia.save()
      }
    }

    const images = request.files('images', {
      size: '1mb',
      extnames: ['jpg', 'jpeg', 'png', 'webp'],
    })

    if (images) {
      const subfolder = 'product-media'

      const serverBaseUrl = Env.get('SERVER_BASEURL')

      for (const image of images) {
        if (image.errors.length) {
          trx.rollback()
          throw new UnprocessableEntityException('image validation failed', image.errors)
        }

        await image.moveToDisk(subfolder)

        const path = await Drive.getUrl(`${subfolder}/${image.fileName}`)

        const url = serverBaseUrl + path

        await ProductMedia.create(
          {
            productId: product.id,
            type: ProductMediaType.image,
            name: `${subfolder}/${image.fileName}`,
            url,
          },
          { client: trx }
        )
      }
    }

    const userManuals = request.files('user_manuals', {
      size: '1mb',
      extnames: ['pdf'],
    })

    if (userManuals) {
      const subfolder = 'product-user-manual'

      const serverBaseUrl = Env.get('SERVER_BASEURL')

      for (const userManual of userManuals) {
        if (userManual.errors.length) {
          trx.rollback()
          throw new UnprocessableEntityException('user manual validation failed', userManual.errors)
        }

        await userManual.moveToDisk(subfolder)

        const path = await Drive.getUrl(`${subfolder}/${userManual.fileName}`)

        const url = serverBaseUrl + path

        const fileUpload = await FileUpload.create(
          {
            name: `${subfolder}/${userManual.fileName}`,
            extname: userManual.extname,
            type: userManual.type,
            size: userManual.size,
            path,
            url,
          },
          { client: trx }
        )

        const productUserManual = new ProductUserManual()
        productUserManual.fileId = fileUpload.id
        productUserManual.productId = product.id

        productUserManual.useTransaction(trx)

        await productUserManual.save()
      }
    }

    const specifications = request.input('specifications')

    if (specifications && Array.isArray(specifications) && specifications.length > 0) {
      const specs = specifications.map((spec) => {
        return {
          productId: product.id,
          name: spec.name,
          value: spec.value,
        }
      })

      await ProductSpecification.createMany(specs, {
        client: trx,
      })
    }

    const clinicalApplications = request.input('clinical_applications')

    if (
      clinicalApplications &&
      Array.isArray(clinicalApplications) &&
      clinicalApplications.length > 0
    ) {
      const clinicalApps = clinicalApplications.map((app) => {
        return {
          productId: product.id,
          content: app.content,
        }
      })

      await ProductClinicalApplication.createMany(clinicalApps, {
        client: trx,
      })
    }

    const workflows = request.input('workflows')

    if (workflows && Array.isArray(workflows) && workflows.length > 0) {
      const wfs = workflows.map((workflow) => {
        return {
          productId: product.id,
          seq: workflow.seq,
          title: workflow.title,
          description: workflow.description,
        }
      })

      await ProductWorkflow.createMany(wfs, {
        client: trx,
      })
    }

    const faqs = request.input('faqs')

    if (faqs && Array.isArray(faqs) && faqs.length > 0) {
      const fqs = faqs.map((faq) => {
        return {
          productId: product.id,
          question: faq.question,
          answer: faq.answer,
        }
      })

      await ProductQA.createMany(fqs, {
        client: trx,
      })
    }

    await product.load('category')
    await product.load('manufacturer')
    await product.load('thumbnail')
    await product.load('clinicalApplications')
    await product.load('media')
    await product.load('questionAnswers')
    await product.load('specifications')
    await product.load('userManuals', (userManual) => {
      userManual.preload('file')
    })
    await product.load('workflows')
    await product.load('comparisons')
    await product.load('tags')

    await trx.commit()

    return product
  }

  public async update({ params, request, bouncer }) {
    await request.validate(UpdateProductValidator)

    const idOrSlug = params.id
    const product = await Product.query().where('id', idOrSlug).orWhere('slug', idOrSlug).first()

    if (!product) {
      throw new NotFoundException('product is not found')
    }

    await product.load('manufacturer')

    await bouncer.with('ProductPolicy').authorize('update', product)

    const categoryId = request.input('category_id')

    if (categoryId) {
      const category = await ProductCategory.find(categoryId)

      if (!category) {
        throw new UnprocessableEntityException('category_id is not found')
      }
    }

    const thumbnail = request.file('thumbnail', {
      size: '1mb',
      extnames: ['jpg', 'jpeg', 'png', 'webp'],
    })

    if (thumbnail) {
      if (thumbnail.errors.length) {
        throw new UnprocessableEntityException('thumbnail validation failed', thumbnail.errors)
      }
      const subfolder = 'product-thumbnail'
      await thumbnail.moveToDisk(subfolder)

      const serverBaseUrl = Env.get('SERVER_BASEURL')
      const path = await Drive.getUrl(`${subfolder}/${thumbnail.fileName}`)

      const url = serverBaseUrl + path

      const fileUpload = await FileUpload.find(product.thumbnailId)

      if (!fileUpload) {
        const fileUpload = await FileUpload.create({
          name: `${subfolder}/${thumbnail.fileName}`,
          extname: thumbnail.extname,
          type: thumbnail.type,
          size: thumbnail.size,
          path,
          url,
        })

        product.thumbnailId = fileUpload.id
      } else {
        await Drive.delete(fileUpload.name)

        fileUpload.name = `${subfolder}/${thumbnail.fileName}`
        fileUpload.extname = thumbnail.extname
        fileUpload.type = thumbnail.type
        fileUpload.size = thumbnail.size
        fileUpload.path = path
        fileUpload.url = url

        await fileUpload.save()
      }
    }

    const trx = await Database.transaction()

    const tags = request.input('tags', '')

    const tagsArray = tags.split(',')
    const tagIds: number[] = []

    for (const tag of tagsArray) {
      let newTag = await Tag.findBy('name', tag)

      if (!newTag) {
        newTag = await Tag.create(
          {
            name: tag,
          },
          { client: trx }
        )
      }

      tagIds.push(newTag.id)
    }

    let isPublished = request.input('is_published')

    if (typeof isPublished === 'string') {
      isPublished = isPublished === 'true'
    }

    product.name = request.input('name')
    product.description = request.input('description')
    product.isPublished = isPublished
    if (categoryId) {
      product.categoryId = categoryId
    }

    product.useTransaction(trx)
    await product.save()

    if (tagIds.length > 0) {
      await product.related('tags').sync(tagIds, true, trx)
    }

    await product.load('category')
    await product.load('media')
    await product.load('manufacturer')
    await product.load('thumbnail')
    await product.load('tags')

    await trx.commit()

    return product
  }

  public async show({ params, bouncer }: HttpContextContract) {
    const idOrSlug = params.id
    const product = await Product.query().where('id', idOrSlug).orWhere('slug', idOrSlug).first()

    if (!product) {
      throw new NotFoundException('product is not found')
    }

    await product.load('category')
    await product.load('media')
    await product.load('tags')
    await product.load('manufacturer', (manufacturer) => {
      manufacturer.preload('user')
      manufacturer.preload('country')
    })
    await product.load('thumbnail')

    await bouncer.with('ProductPolicy').authorize('view', product)

    return product
  }

  public async destroy({ params, bouncer }: HttpContextContract) {
    const idOrSlug = params.id

    const product = await Product.query()
      .where('id', idOrSlug)
      .orWhere('slug', idOrSlug)
      .preload('manufacturer')
      .first()

    if (!product) {
      throw new NotFoundException('Product is not found')
    }

    await bouncer.with('ProductPolicy').authorize('delete', product)

    await product.delete()

    const fileUpload = await FileUpload.find(product.thumbnailId)

    if (fileUpload) {
      await Drive.delete(fileUpload.name)
      await fileUpload.delete()
    }

    return {
      message: `SUCCESS: product deleted`,
      code: 'SUCCESS',
    }
  }
}
