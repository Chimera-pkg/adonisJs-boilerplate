import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database'
import Drive from '@ioc:Adonis/Core/Drive'
import Env from '@ioc:Adonis/Core/Env'
import UnprocessableEntityException from 'App/Exceptions/UnprocessableEntityException'
import Manufacturer from 'App/Models/Manufacturer'
import Service from 'App/Models/Service'
import ServiceCategory from 'App/Models/ServiceCategory'
import CreateServiceValidator from 'App/Validators/Service/CreateServiceValidator'
import FileUpload from 'App/Models/FileUpload'
import ServiceMedia, { ServiceMediaType } from 'App/Models/ServiceMedia'
import ServiceUserManual from 'App/Models/ServiceUserManual'
import ServiceSpecification from 'App/Models/ServiceSpecification'
import ServiceClinicalApplication from 'App/Models/ServiceClinicalApplication'
import ServiceWorkflow from 'App/Models/ServiceWorkflow'
import ServiceQA from 'App/Models/ServiceQA'
import UpdateServiceValidator from 'App/Validators/Service/UpdateServiceValidator'
import NotFoundException from 'App/Exceptions/NotFoundException'
import Tag from 'App/Models/Tag'
import IndexServiceValidator from 'App/Validators/Service/IndexServiceValidator'

export default class ServicesController {
  public async index({ bouncer, auth, request }: HttpContextContract) {
    await request.validate(IndexServiceValidator)

    const page = request.input('page', 1) || 1
    const limit = request.input('limit', 10) || 10
    const manufacturerId = request.input('manufacturer_id')
    const keyword = request.input('keyword')
    const sort = request.input('sort', 'id')
    const order = request.input('order', 'asc')
    const countryIdsStr = request.input('country_ids', '')
    const categoryIdsStr = request.input('category_ids', '')

    await bouncer.with('ServicePolicy').authorize('viewList')

    let user = auth.user

    if (user) {
      await user.load('manufacturer')
    }

    const servicesQuery = Service.query()
      .withScopes((scopes) => scopes.visibleTo(user))
      .preload('category')
      .preload('manufacturer', (loader) => {
        loader.preload('user')
        loader.preload('country')
      })
      .preload('thumbnail')
      .preload('tags')

    if (manufacturerId) {
      servicesQuery.where('manufacturerId', manufacturerId)
    }

    if (keyword) {
      servicesQuery.where('name', 'like', `%${keyword}%`)
      servicesQuery.orWhere('description', 'like', `%${keyword}%`)
    }

    if (sort) {
      servicesQuery.orderBy(sort, order)
    }

    if (countryIdsStr) {
      const countryIds: string[] = countryIdsStr.split(',')

      servicesQuery.whereHas('manufacturer', (manufacturer) => {
        manufacturer.whereIn('countryId', countryIds)
      })
    }

    if (categoryIdsStr) {
      const categoryIds: string[] = categoryIdsStr.split(',')

      servicesQuery.whereIn('categoryId', categoryIds)
    }

    const services = await servicesQuery.paginate(page, limit)

    services.baseUrl('/services')

    return services
  }

  public async store({ request, auth, bouncer }) {
    await request.validate(CreateServiceValidator)

    await bouncer.with('ServicePolicy').authorize('create')

    const user = await auth.authenticate()

    const categoryId = request.input('category_id')

    const manufacturer = await Manufacturer.findBy('userId', user.id)

    if (!manufacturer) {
      throw new UnprocessableEntityException('manufacturer_id is not found')
    }

    await manufacturer.load('user')

    const category = await ServiceCategory.find(categoryId)

    if (!category) {
      throw new UnprocessableEntityException('category_id is not found')
    }

    const trx = await Database.transaction()

    const thumbnail = request.file('thumbnail')

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

    const service = new Service()

    let fileUpload

    if (thumbnail) {
      const subfolder = 'service-thumbnail'

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

      service.thumbnailId = fileUpload.id
    }

    let isPublished = request.input('is_published')

    if (typeof isPublished === 'string') {
      isPublished = isPublished === 'true'
    }

    service.name = request.input('name')
    service.description = request.input('description')
    service.isPublished = isPublished
    service.categoryId = categoryId
    service.manufacturerId = manufacturer.id

    service.useTransaction(trx)
    await service.save()

    if (tagIds.length > 0) {
      await service.related('tags').attach(tagIds, trx)
    }

    const videos = request.input('videos', [])

    if (videos) {
      for (const video of videos) {
        const serviceMedia = new ServiceMedia()

        serviceMedia.serviceId = service.id
        serviceMedia.type = ServiceMediaType.video
        serviceMedia.name = 'video'
        serviceMedia.url = video

        serviceMedia.useTransaction(trx)
        await serviceMedia.save()
      }
    }

    const images = request.files('images', {
      size: '1mb',
      extnames: ['jpg', 'jpeg', 'png', 'webp'],
    })

    if (images) {
      const subfolder = 'service-media'

      const serverBaseUrl = Env.get('SERVER_BASEURL')

      for (const image of images) {
        if (image.errors.length) {
          trx.rollback()
          throw new UnprocessableEntityException('image validation failed', image.errors)
        }

        await image.moveToDisk(subfolder)

        const path = await Drive.getUrl(`${subfolder}/${image.fileName}`)

        const url = serverBaseUrl + path

        await ServiceMedia.create(
          {
            serviceId: service.id,
            type: ServiceMediaType.image,
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
      const subfolder = 'service-user-manual'

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

        const serviceUserManual = new ServiceUserManual()
        serviceUserManual.fileId = fileUpload.id
        serviceUserManual.serviceId = service.id

        serviceUserManual.useTransaction(trx)

        await serviceUserManual.save()
      }
    }

    const specifications = request.input('specifications')

    if (specifications && Array.isArray(specifications) && specifications.length > 0) {
      const specs = specifications.map((spec) => {
        return {
          serviceId: service.id,
          name: spec.name,
          value: spec.value,
        }
      })

      await ServiceSpecification.createMany(specs, {
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
          serviceId: service.id,
          content: app.content,
        }
      })

      await ServiceClinicalApplication.createMany(clinicalApps, {
        client: trx,
      })
    }

    const workflows = request.input('workflows')

    if (workflows && Array.isArray(workflows) && workflows.length > 0) {
      const wfs = workflows.map((workflow) => {
        return {
          serviceId: service.id,
          seq: workflow.seq,
          title: workflow.title,
          description: workflow.description,
        }
      })

      await ServiceWorkflow.createMany(wfs, {
        client: trx,
      })
    }

    const faqs = request.input('faqs')

    if (faqs && Array.isArray(faqs) && faqs.length > 0) {
      const fqs = faqs.map((faq) => {
        return {
          serviceId: service.id,
          question: faq.question,
          answer: faq.answer,
        }
      })

      await ServiceQA.createMany(fqs, {
        client: trx,
      })
    }

    await service.load('category')
    await service.load('manufacturer')
    await service.load('thumbnail')
    await service.load('clinicalApplications')
    await service.load('media')
    await service.load('questionAnswers')
    await service.load('specifications')
    await service.load('userManuals', (userManual) => {
      userManual.preload('file')
    })
    await service.load('workflows')
    await service.load('comparisons')
    await service.load('tags')

    await trx.commit()

    return service
  }

  public async update({ params, request, bouncer }) {
    await request.validate(UpdateServiceValidator)

    const idOrSlug = params.id
    const service = await Service.query().where('id', idOrSlug).orWhere('slug', idOrSlug).first()

    if (!service) {
      throw new NotFoundException('service is not found')
    }

    await service.load('manufacturer')

    await bouncer.with('ServicePolicy').authorize('update', service)

    const categoryId = request.input('category_id')

    if (categoryId) {
      const category = await ServiceCategory.find(categoryId)

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
      const subfolder = 'service-thumbnail'
      await thumbnail.moveToDisk(subfolder)

      const serverBaseUrl = Env.get('SERVER_BASEURL')
      const path = await Drive.getUrl(`${subfolder}/${thumbnail.fileName}`)

      const url = serverBaseUrl + path

      const fileUpload = await FileUpload.find(service.thumbnailId)

      if (!fileUpload) {
        const fileUpload = await FileUpload.create({
          name: `${subfolder}/${thumbnail.fileName}`,
          extname: thumbnail.extname,
          type: thumbnail.type,
          size: thumbnail.size,
          path,
          url,
        })

        service.thumbnailId = fileUpload.id
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

    service.name = request.input('name')
    service.description = request.input('description')
    service.isPublished = isPublished
    if (categoryId) {
      service.categoryId = categoryId
    }

    await service.useTransaction(trx)
    await service.save()

    if (tagIds.length > 0) {
      await service.related('tags').sync(tagIds, true, trx)
    }

    await service.load('category')
    await service.load('media')
    await service.load('manufacturer')
    await service.load('thumbnail')
    await service.load('tags')

    return service
  }

  public async show({ params, bouncer }: HttpContextContract) {
    const idOrSlug = params.id
    const service = await Service.query().where('id', idOrSlug).orWhere('slug', idOrSlug).first()

    if (!service) {
      throw new NotFoundException('service is not found')
    }

    await service.load('category')
    await service.load('media')
    await service.load('manufacturer', (loader) => {
      loader.preload('user')
    })
    await service.load('thumbnail')
    await service.load('tags')

    await bouncer.with('ServicePolicy').authorize('view', service)

    return service
  }

  public async destroy({ params, bouncer }: HttpContextContract) {
    const idOrSlug = params.id
    const service = await Service.query().where('id', idOrSlug).orWhere('slug', idOrSlug).first()

    if (!service) {
      throw new NotFoundException('service is not found')
    }

    await service.load('manufacturer')

    await bouncer.with('ServicePolicy').authorize('delete', service)

    await service.delete()

    const fileUpload = await FileUpload.find(service.thumbnailId)

    if (fileUpload) {
      await Drive.delete(fileUpload.name)
      await fileUpload.delete()
    }

    return {
      message: `SUCCESS: service deleted`,
      code: 'SUCCESS',
    }
  }
}
