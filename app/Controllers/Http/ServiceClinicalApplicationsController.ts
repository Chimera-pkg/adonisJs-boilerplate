import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import NotFoundException from 'App/Exceptions/NotFoundException'
import Service from 'App/Models/Service'
import ServiceClinicalApplication from 'App/Models/ServiceClinicalApplication'
import CreateServiceClinicalApplicationValidator from 'App/Validators/Service/ServiceClinicalApplication/Create'
import UpdateServiceClinicalApplicationValidator from 'App/Validators/Service/ServiceClinicalApplication/Update'

export default class ServiceClinicalApplicationsController {
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

    await bouncer.with('ServiceClinicalApplicationPolicy').authorize('viewList', service)

    const page = request.input('page', 1)
    const limit = request.input('limit', 10)

    const serviceClinicalApplications = await ServiceClinicalApplication.query()
      .where('serviceId', service.id)
      .preload('service')
      .paginate(page, limit)

    serviceClinicalApplications.baseUrl(`/services/${idOrSlug}/clinical-applications`)

    return serviceClinicalApplications
  }

  public async store({ request, bouncer }: HttpContextContract) {
    await request.validate(CreateServiceClinicalApplicationValidator)
    const idOrSlug = request.param('service_id')

    const service = await Service.query()
      .where('id', idOrSlug)
      .orWhere('slug', idOrSlug)
      .preload('manufacturer')
      .first()

    if (!service) {
      throw new NotFoundException('Service is not found')
    }

    await bouncer.with('ServiceClinicalApplicationPolicy').authorize('create', service)

    const serviceClinicalApplication = new ServiceClinicalApplication()
    serviceClinicalApplication.serviceId = service.id
    serviceClinicalApplication.content = request.input('content')

    await serviceClinicalApplication.save()

    await serviceClinicalApplication.load('service')

    return serviceClinicalApplication
  }

  public async update({ request, bouncer }: HttpContextContract) {
    await request.validate(UpdateServiceClinicalApplicationValidator)

    const idOrSlug = request.param('service_id')
    const serviceClinicalApplicationId = request.param('id')

    const service = await Service.query()
      .where('id', idOrSlug)
      .orWhere('slug', idOrSlug)
      .preload('manufacturer')
      .first()

    if (!service) {
      throw new NotFoundException('Service is not found')
    }

    const serviceClinicalApplication = await ServiceClinicalApplication.query()
      .where('id', serviceClinicalApplicationId)
      .andWhere('serviceId', service.id)
      .preload('service', (loader) => {
        loader.preload('manufacturer')
      })
      .first()

    if (!serviceClinicalApplication) {
      throw new NotFoundException('Service Clinical Application is not found')
    }

    await bouncer
      .with('ServiceClinicalApplicationPolicy')
      .authorize('update', serviceClinicalApplication.service)

    serviceClinicalApplication.content = request.input('content')

    await serviceClinicalApplication.save()

    await serviceClinicalApplication.refresh()

    return serviceClinicalApplication
  }

  public async destroy({ request, bouncer }: HttpContextContract) {
    const idOrSlug = request.param('service_id')
    const serviceClinicalApplicationId = request.param('id')

    const service = await Service.query()
      .where('id', idOrSlug)
      .orWhere('slug', idOrSlug)
      .preload('manufacturer')
      .first()

    if (!service) {
      throw new NotFoundException('Service is not found')
    }

    const serviceClinicalApplication = await ServiceClinicalApplication.query()
      .where('id', serviceClinicalApplicationId)
      .andWhere('serviceId', service.id)
      .first()

    if (!serviceClinicalApplication) {
      throw new NotFoundException('Service Clinical Application is not found')
    }

    await bouncer.with('ServiceClinicalApplicationPolicy').authorize('delete', service)

    await serviceClinicalApplication.delete()

    return {
      message: `SUCCESS: Service Clinical Application deleted`,
      code: 'SUCCESS',
    }
  }
}
