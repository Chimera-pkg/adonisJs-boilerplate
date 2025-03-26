import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import NotFoundException from 'App/Exceptions/NotFoundException'
import Service from 'App/Models/Service'
import ServiceQA from 'App/Models/ServiceQA'
import CreateServiceQAValidator from 'App/Validators/Service/ServiceQA/Create'
import UpdateServiceQAValidator from 'App/Validators/Service/ServiceQA/Update'

export default class ServiceQAsController {
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

    await bouncer.with('ServiceQAPolicy').authorize('viewList', service)

    const page = request.input('page', 1)
    const limit = request.input('limit', 10)

    const serviceQAs = await ServiceQA.query()
      .where('serviceId', service.id)
      .preload('service')
      .paginate(page, limit)

    serviceQAs.baseUrl(`/services/${idOrSlug}/question-answers`)

    return serviceQAs
  }

  public async store({ request, bouncer }: HttpContextContract) {
    await request.validate(CreateServiceQAValidator)

    const idOrSlug = request.param('service_id')

    const service = await Service.query()
      .where('id', idOrSlug)
      .orWhere('slug', idOrSlug)
      .preload('manufacturer')
      .first()

    if (!service) {
      throw new NotFoundException('Service is not found')
    }

    await bouncer.with('ServiceQAPolicy').authorize('create', service)

    const serviceQA = new ServiceQA()
    serviceQA.serviceId = service.id
    serviceQA.question = request.input('question')
    serviceQA.answer = request.input('answer')

    await serviceQA.save()

    await serviceQA.load('service')

    return serviceQA
  }

  public async update({ request, bouncer }: HttpContextContract) {
    await request.validate(UpdateServiceQAValidator)

    const idOrSlug = request.param('service_id')

    const service = await Service.query()
      .where('id', idOrSlug)
      .orWhere('slug', idOrSlug)
      .preload('manufacturer')
      .first()

    if (!service) {
      throw new NotFoundException('Service is not found')
    }

    await bouncer.with('ServiceQAPolicy').authorize('update', service)

    const serviceQAId = request.param('id')

    const serviceQA = await ServiceQA.query()
      .where('id', serviceQAId)
      .andWhere('serviceId', service.id)
      .first()

    if (!serviceQA) {
      throw new NotFoundException('Service Question Answer is not found')
    }

    serviceQA.question = request.input('question')
    serviceQA.answer = request.input('answer')

    await serviceQA.save()

    await serviceQA.refresh()

    return serviceQA
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

    await bouncer.with('ServiceQAPolicy').authorize('delete', service)

    const serviceQAId = request.param('id')

    const serviceQA = await ServiceQA.query()
      .where('id', serviceQAId)
      .andWhere('serviceId', service.id)
      .first()

    if (!serviceQA) {
      throw new NotFoundException('Service Question Answer is not found')
    }

    await serviceQA.delete()

    return {
      message: `SUCCESS: Service Question Answer deleted`,
      code: 'SUCCESS',
    }
  }
}
