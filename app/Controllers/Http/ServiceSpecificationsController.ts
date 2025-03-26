import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import NotFoundException from 'App/Exceptions/NotFoundException'
import Service from 'App/Models/Service'
import ServiceSpecification from 'App/Models/ServiceSpecification'
import CreateServiceSpecificationValidator from 'App/Validators/Service/ServiceSpecification/Create'
import UpdateServiceSpecificationValidator from 'App/Validators/Service/ServiceSpecification/Update'

export default class ServiceSpecificationsController {
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

    await bouncer.with('ServiceSpecificationPolicy').authorize('viewList', service)

    const page = request.input('page', 1)
    const limit = request.input('limit', 10)

    const serviceSpecifications = await ServiceSpecification.query()
      .where('serviceId', service.id)
      .preload('service')
      .paginate(page, limit)

    serviceSpecifications.baseUrl(`/services/${idOrSlug}/specifications`)

    return serviceSpecifications
  }

  public async store({ request, bouncer }: HttpContextContract) {
    await request.validate(CreateServiceSpecificationValidator)

    const idOrSlug = request.param('service_id')

    const service = await Service.query()
      .where('id', idOrSlug)
      .orWhere('slug', idOrSlug)
      .preload('manufacturer')
      .first()

    if (!service) {
      throw new NotFoundException('Service is not found')
    }

    await bouncer.with('ServiceSpecificationPolicy').authorize('create', service)

    const serviceSpecification = new ServiceSpecification()
    serviceSpecification.serviceId = service.id
    serviceSpecification.name = request.input('name')
    serviceSpecification.value = request.input('value')

    await serviceSpecification.save()

    await serviceSpecification.load('service')

    return serviceSpecification
  }

  public async update({ request, bouncer }: HttpContextContract) {
    await request.validate(UpdateServiceSpecificationValidator)

    const idOrSlug = request.param('service_id')

    const service = await Service.query()
      .where('id', idOrSlug)
      .orWhere('slug', idOrSlug)
      .preload('manufacturer')
      .first()

    if (!service) {
      throw new NotFoundException('Service is not found')
    }

    await bouncer.with('ServiceSpecificationPolicy').authorize('update', service)

    const serviceSpecificationId = request.param('id')

    const serviceSpecification = await ServiceSpecification.query()
      .where('id', serviceSpecificationId)
      .andWhere('serviceId', service.id)
      .first()

    if (!serviceSpecification) {
      throw new NotFoundException('Service Specification is not found')
    }

    serviceSpecification.name = request.input('name')
    serviceSpecification.value = request.input('value')

    await serviceSpecification.save()

    await serviceSpecification.refresh()

    return serviceSpecification
  }

  public async destroy({ request, bouncer }: HttpContextContract) {
    const idOrSlug = request.param('service_id')

    const service = await Service.query()
      .where('id', idOrSlug)
      .orWhere('slug', idOrSlug)
      .preload('manufacturer')
      .first()

    if (!service) {
      throw new NotFoundException('Service is not found')
    }

    await bouncer.with('ServiceSpecificationPolicy').authorize('delete', service)

    const serviceSpecificationId = request.param('id')

    const serviceSpecification = await ServiceSpecification.query()
      .where('id', serviceSpecificationId)
      .andWhere('serviceId', service.id)
      .first()

    if (!serviceSpecification) {
      throw new NotFoundException('Service Specification is not found')
    }

    await serviceSpecification.delete()

    return {
      message: `SUCCESS: Service Specification deleted`,
      code: 'SUCCESS',
    }
  }
}
