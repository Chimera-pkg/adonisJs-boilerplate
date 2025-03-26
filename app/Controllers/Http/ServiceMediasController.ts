import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Drive from '@ioc:Adonis/Core/Drive'
import Env from '@ioc:Adonis/Core/Env'
import NotFoundException from 'App/Exceptions/NotFoundException'
import UnprocessableEntityException from 'App/Exceptions/UnprocessableEntityException'
import Service from 'App/Models/Service'
import ServiceMedia, { ServiceMediaType } from 'App/Models/ServiceMedia'
import CreateServiceMediaValidator from 'App/Validators/Service/ServiceMedia/Create'

export default class ServiceMediasController {
  public async index({ request, bouncer }: HttpContextContract) {
    const idOrSlug = request.param('service_id')

    const service = await Service.query().where('id', idOrSlug).orWhere('slug', idOrSlug).first()

    if (!service) {
      throw new NotFoundException('Service is not found')
    }

    await service.load('manufacturer')

    await bouncer.with('ServiceMediaPolicy').authorize('viewList', service)

    const page = request.input('page', 1)
    const limit = request.input('limit', 10)

    const serviceMedias = await ServiceMedia.query()
      .where('serviceId', service.id)
      .paginate(page, limit)

    serviceMedias.baseUrl(`/services/${idOrSlug}/media`)

    return serviceMedias
  }

  public async store({ request, bouncer }) {
    await request.validate(CreateServiceMediaValidator)

    const idOrSlug = request.param('service_id')

    const service = await Service.query().where('id', idOrSlug).orWhere('slug', idOrSlug).first()

    if (!service) {
      throw new NotFoundException('Service is not found')
    }
    await service.load('manufacturer')

    await bouncer.with('ServiceMediaPolicy').authorize('create', service)

    const image = request.file('image')
    const name = request.input('name')
    const inputUrl = request.input('url')
    const type = request.input('type')

    if (type === ServiceMediaType.image && !image) {
      throw new UnprocessableEntityException('"image" field is required when type is "image"')
    }

    if (type !== ServiceMediaType.image) {
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

    const serviceMedia = new ServiceMedia()

    if (type === ServiceMediaType.image && image) {
      console.log('image', image)
      const subfolder = 'service-media'
      await image.moveToDisk(subfolder)

      const serverBaseUrl = Env.get('SERVER_BASEURL')
      const path = await Drive.getUrl(`${subfolder}/${image.fileName}`)

      const url = serverBaseUrl + path

      serviceMedia.name = `${subfolder}/${image.fileName}`
      serviceMedia.url = url
    } else {
      serviceMedia.name = name
      serviceMedia.url = inputUrl
    }

    serviceMedia.serviceId = service.id
    serviceMedia.type = type

    await serviceMedia.save()

    return serviceMedia
  }

  public async destroy({ request, bouncer }: HttpContextContract) {
    const idOrSlug = request.param('service_id')
    const serviceMediaId = request.param('id')

    const service = await Service.query().where('id', idOrSlug).orWhere('slug', idOrSlug).first()

    if (!service) {
      throw new NotFoundException('Service is not found')
    }

    await service.load('manufacturer')

    await bouncer.with('ServiceMediaPolicy').authorize('delete', service)

    const serviceMedia = await ServiceMedia.query()
      .where('id', serviceMediaId)
      .andWhere('serviceId', service.id)
      .first()

    if (!serviceMedia) {
      throw new NotFoundException('Service media is not found')
    }

    if (serviceMedia.type === ServiceMediaType.image) {
      await Drive.delete(serviceMedia.name)
    }

    await serviceMedia.delete()

    return {
      message: `SUCCESS: Service media deleted`,
      code: 'SUCCESS',
    }
  }
}
