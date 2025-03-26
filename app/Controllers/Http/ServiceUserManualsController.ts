import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Drive from '@ioc:Adonis/Core/Drive'
import Env from '@ioc:Adonis/Core/Env'
import NotFoundException from 'App/Exceptions/NotFoundException'
import FileUpload from 'App/Models/FileUpload'
import Service from 'App/Models/Service'
import ServiceUserManual from 'App/Models/ServiceUserManual'
import CreateServiceUserManualValidator from 'App/Validators/Service/ServiceUserManual/Create'

export default class ServiceUserManualsController {
  public async index({ request, bouncer }: HttpContextContract) {
    const idOrSlug = request.param('service_id')

    const service = await Service.query()
      .where('id', idOrSlug)
      .orWhere('slug', idOrSlug)
      .preload('manufacturer')
      .first()

    if (!service) {
      throw new NotFoundException('Service is not found')
    }

    await bouncer.with('ServiceUserManualPolicy').authorize('viewList', service)

    const page = request.input('page', 1)
    const limit = request.input('limit', 10)

    const serviceUserManuals = await ServiceUserManual.query()
      .where('serviceId', service.id)
      .preload('file')
      .preload('service')
      .paginate(page, limit)

    serviceUserManuals.baseUrl(`/services/${idOrSlug}/user-manuals`)

    return serviceUserManuals
  }

  public async store({ request, bouncer }) {
    await request.validate(CreateServiceUserManualValidator)

    const idOrSlug = request.param('service_id')

    const service = await Service.query().where('id', idOrSlug).orWhere('slug', idOrSlug).first()

    if (!service) {
      throw new NotFoundException('Service is not found')
    }
    await service.load('manufacturer')

    await bouncer.with('ServiceUserManualPolicy').authorize('create', service)

    const file = request.file('file')

    const subfolder = 'service-user-manual'
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

    const serviceUserManual = new ServiceUserManual()
    serviceUserManual.fileId = fileUpload.id
    serviceUserManual.serviceId = service.id

    await serviceUserManual.save()

    await serviceUserManual.load('file')
    await serviceUserManual.load('service')

    return serviceUserManual
  }

  public async destroy({ request, bouncer }: HttpContextContract) {
    const idOrSlug = request.param('service_id')
    const serviceUserManualId = request.param('id')

    const service = await Service.query().where('id', idOrSlug).orWhere('slug', idOrSlug).first()

    if (!service) {
      throw new NotFoundException('Service is not found')
    }

    await service.load('manufacturer')

    const serviceUserManual = await ServiceUserManual.query()
      .where('id', serviceUserManualId)
      .andWhere('serviceId', service.id)

      .first()

    if (!serviceUserManual) {
      throw new NotFoundException('Service user manual is not found')
    }

    await bouncer.with('ServiceUserManualPolicy').authorize('delete', service)

    await serviceUserManual.load('file')

    await Drive.delete(serviceUserManual.file.name)

    await serviceUserManual.delete()

    return {
      message: `SUCCESS: Service user manual deleted`,
      code: 'SUCCESS',
    }
  }
}
