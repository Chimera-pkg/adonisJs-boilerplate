import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import NotFoundException from 'App/Exceptions/NotFoundException'
import UnprocessableEntityException from 'App/Exceptions/UnprocessableEntityException'
import Service from 'App/Models/Service'
import ServiceWorkflow from 'App/Models/ServiceWorkflow'
import CreateServiceWorkflowValidator from 'App/Validators/Service/ServiceWorkflow/Create'
import UpdateServiceWorkflowValidator from 'App/Validators/Service/ServiceWorkflow/Update'

export default class ServiceWorkflowsController {
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

    await bouncer.with('ServiceWorkflowPolicy').authorize('viewList', service)

    const page = request.input('page', 1)
    const limit = request.input('limit', 10)

    const serviceWorkflows = await ServiceWorkflow.query()
      .where('serviceId', service.id)
      .preload('service')
      .paginate(page, limit)

    serviceWorkflows.baseUrl(`/services/${idOrSlug}/workflows`)

    return serviceWorkflows
  }

  public async store({ request, bouncer }: HttpContextContract) {
    await request.validate(CreateServiceWorkflowValidator)
    const idOrSlug = request.param('service_id')

    const service = await Service.query()
      .where('id', idOrSlug)
      .orWhere('slug', idOrSlug)
      .preload('manufacturer')
      .first()

    if (!service) {
      throw new NotFoundException('Service is not found')
    }

    await bouncer.with('ServiceWorkflowPolicy').authorize('create', service)

    const seq = request.input('seq')

    let serviceWorkflow = await ServiceWorkflow.query()
      .where('serviceId', service.id)
      .andWhere('seq', seq)
      .first()

    if (serviceWorkflow) {
      throw new UnprocessableEntityException('Service workflow seq already exists')
    }

    serviceWorkflow = new ServiceWorkflow()
    serviceWorkflow.serviceId = service.id
    serviceWorkflow.seq = seq
    serviceWorkflow.title = request.input('title')
    serviceWorkflow.description = request.input('description')

    await serviceWorkflow.save()

    await serviceWorkflow.load('service')

    return serviceWorkflow
  }

  public async update({ request, bouncer }: HttpContextContract) {
    await request.validate(UpdateServiceWorkflowValidator)

    const idOrSlug = request.param('service_id')

    const service = await Service.query()
      .where('id', idOrSlug)
      .orWhere('slug', idOrSlug)
      .preload('manufacturer')
      .first()

    if (!service) {
      throw new NotFoundException('Service is not found')
    }

    const serviceWorkflowId = request.param('id')

    const serviceWorkflow = await ServiceWorkflow.query()
      .where('id', serviceWorkflowId)
      .andWhere('serviceId', service.id)
      .preload('service', (loader) => {
        loader.preload('manufacturer')
      })
      .first()

    if (!serviceWorkflow) {
      throw new NotFoundException('Service Workflow is not found')
    }

    await bouncer.with('ServiceWorkflowPolicy').authorize('update', serviceWorkflow.service)

    const seq = request.input('seq')
    const title = request.input('title')
    const description = request.input('description')

    if (Number(seq) !== serviceWorkflow.seq) {
      const anotherServiceWorkflow = await ServiceWorkflow.query()
        .where('serviceId', service.id)
        .andWhere('seq', seq)
        .first()

      if (anotherServiceWorkflow) {
        throw new UnprocessableEntityException('Service workflow seq already exists')
      }
    }

    if (seq) {
      serviceWorkflow.seq = seq
    }

    if (title) {
      serviceWorkflow.title = title
    }

    if (description) {
      serviceWorkflow.description = description
    }

    await serviceWorkflow.save()

    await serviceWorkflow.refresh()

    return serviceWorkflow
  }

  public async destroy({ request, bouncer }: HttpContextContract) {
    const idOrSlug = request.param('service_id')
    const serviceWorkflowId = request.param('id')

    const service = await Service.query()
      .where('id', idOrSlug)
      .orWhere('slug', idOrSlug)
      .preload('manufacturer')
      .first()

    if (!service) {
      throw new NotFoundException('Service is not found')
    }

    const serviceWorkflow = await ServiceWorkflow.query()
      .where('id', serviceWorkflowId)
      .andWhere('serviceId', service.id)
      .first()

    if (!serviceWorkflow) {
      throw new NotFoundException('Service Workflow is not found')
    }

    await bouncer.with('ServiceWorkflowPolicy').authorize('delete', service)

    await serviceWorkflow.delete()

    return {
      message: `SUCCESS: Service Workflow deleted`,
      code: 'SUCCESS',
    }
  }
}
