import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import NotFoundException from 'App/Exceptions/NotFoundException'
import UnprocessableEntityException from 'App/Exceptions/UnprocessableEntityException'
import Service from 'App/Models/Service'
import ServiceComparison from 'App/Models/ServiceComparison'
import ServiceCompSpec from 'App/Models/ServiceCompSpec'
import ServiceSpecification from 'App/Models/ServiceSpecification'
import CreateServiceComparisonValidator from 'App/Validators/Service/ServiceComparison/Create'

export type CreateSpecInput = {
  origin_spec_id: number
  comp_spec_id: number
}

export function isExist(newServiceCompSpecs: Partial<ServiceCompSpec>[], search: CreateSpecInput) {
  const index = newServiceCompSpecs.findIndex(
    (spec) => spec.originSpecId === search.origin_spec_id || spec.compSpecId === search.comp_spec_id
  )

  if (index > -1) return true
  return false
}

export default class ServiceComparisonsController {
  public async index({ bouncer, request }: HttpContextContract) {
    const page = request.input('page', 1)
    const limit = request.input('limit', 10)

    const idOrSlug = request.param('service_id')

    const service = await Service.query()
      .where('id', idOrSlug)
      .orWhere('slug', idOrSlug)
      .preload('manufacturer')
      .first()

    if (!service) {
      throw new NotFoundException('Service is not found')
    }

    await bouncer.with('ServiceComparisonPolicy').authorize('viewList', service)

    const serviceComparisons = await ServiceComparison.query()
      .preload('service', (service) => {
        service.preload('thumbnail')
      })
      .preload('compService')
      .preload('specs', (spec) => {
        spec.preload('originSpec')
        spec.preload('compSpec')
      })
      .paginate(page, limit)

    serviceComparisons.baseUrl(`/services/${idOrSlug}/comparisons`)

    return serviceComparisons
  }

  public async store({ request, bouncer }: HttpContextContract) {
    await request.validate(CreateServiceComparisonValidator)

    const idOrSlug = request.param('service_id')

    const service = await Service.query()
      .where('id', idOrSlug)
      .orWhere('slug', idOrSlug)
      .preload('manufacturer')
      .first()

    if (!service) {
      throw new NotFoundException('Service is not found')
    }

    await bouncer.with('ServiceComparisonPolicy').authorize('create', service)

    const compServiceId = request.input('comp_service_id')

    if (Number(service.id) === Number(compServiceId)) {
      throw new UnprocessableEntityException('Compared service id cannot be same with service id')
    }

    const compService = await Service.find(compServiceId)

    if (!compService) {
      throw new NotFoundException('Compared service is not found')
    }

    let exist = await ServiceComparison.query()
      .where('serviceId', service.id)
      .andWhere('compServiceId', compServiceId)
      .first()

    if (exist) {
      throw new UnprocessableEntityException('Service comparison already exists')
    }

    const newProdCompSpecs: Partial<ServiceCompSpec>[] = []
    const inputSpecs: CreateSpecInput[] = request.input('specs')

    for (const inputSpec of inputSpecs) {
      if (!isExist(newProdCompSpecs, inputSpec)) {
        const originSpec = await ServiceSpecification.query()
          .where('id', inputSpec.origin_spec_id)
          .andWhere('serviceId', service.id)
          .first()

        if (!originSpec) {
          throw new UnprocessableEntityException(
            `origin spec with id ${inputSpec.origin_spec_id} is not found`
          )
        }

        const compSpec = await ServiceSpecification.query()
          .where('id', inputSpec.comp_spec_id)
          .andWhere('serviceId', compServiceId)
          .first()

        if (!compSpec) {
          throw new UnprocessableEntityException(
            `comp spec with id ${inputSpec.comp_spec_id} is not found`
          )
        }

        newProdCompSpecs.push({
          serviceComparisonId: 0,
          originSpecId: inputSpec.origin_spec_id,
          compSpecId: inputSpec.comp_spec_id,
        })
      } else {
        throw new UnprocessableEntityException('There is duplicate specs')
      }
    }

    const serviceComparison = new ServiceComparison()
    serviceComparison.serviceId = service.id
    serviceComparison.compServiceId = compServiceId

    await serviceComparison.save()

    newProdCompSpecs.forEach(
      (_, i) => (newProdCompSpecs[i].serviceComparisonId = serviceComparison.id)
    )

    await ServiceCompSpec.createMany(newProdCompSpecs)

    await serviceComparison.load('service', (service) => {
      service.preload('thumbnail')
    })
    await serviceComparison.load('specs', (specs) => {
      specs.preload('originSpec')
      specs.preload('compSpec')
    })

    return serviceComparison
  }

  public async update({ request, bouncer }: HttpContextContract) {
    await request.validate(CreateServiceComparisonValidator)

    const idOrSlug = request.param('service_id')

    const service = await Service.query()
      .where('id', idOrSlug)
      .orWhere('slug', idOrSlug)
      .preload('manufacturer')
      .first()

    if (!service) {
      throw new NotFoundException('Service is not found')
    }

    const serviceComparisonId = request.param('id')

    if (!service) {
      throw new NotFoundException('Service is not found')
    }
    await service.load('manufacturer')

    await bouncer.with('ServiceComparisonPolicy').authorize('update', service)

    const compServiceId = request.input('comp_service_id')

    if (Number(service.id) === Number(compServiceId)) {
      throw new UnprocessableEntityException('Compared service id cannot be same with service id')
    }

    const compService = await Service.find(compServiceId)

    if (!compService) {
      throw new NotFoundException('Compared service is not found')
    }

    const serviceComparison = await ServiceComparison.query()
      .where('id', serviceComparisonId)
      .andWhere('serviceId', service.id)
      .first()

    if (!serviceComparison) {
      throw new NotFoundException('Service comparison is not found')
    }

    if (serviceComparison.compServiceId !== Number(compServiceId)) {
      // make sure there is no duplicate compared service
      const exist = await ServiceComparison.query()
        .where('serviceId', service.id)
        .andWhere('compServiceId', compServiceId)
        .first()

      if (exist) {
        throw new UnprocessableEntityException('Service comparison already exists')
      }
    }

    await ServiceCompSpec.query().where('serviceComparisonId', serviceComparison.id).delete()

    const newProdCompSpecs: Partial<ServiceCompSpec>[] = []
    const inputSpecs: CreateSpecInput[] = request.input('specs')

    for (const inputSpec of inputSpecs) {
      if (!isExist(newProdCompSpecs, inputSpec)) {
        const originSpec = await ServiceSpecification.query()
          .where('id', inputSpec.origin_spec_id)
          .andWhere('serviceId', service.id)
          .first()

        if (!originSpec) {
          throw new UnprocessableEntityException(
            `origin spec with id ${inputSpec.origin_spec_id} is not found`
          )
        }

        const compSpec = await ServiceSpecification.query()
          .where('id', inputSpec.comp_spec_id)
          .andWhere('serviceId', compServiceId)
          .first()

        if (!compSpec) {
          throw new UnprocessableEntityException(
            `comp spec with id ${inputSpec.comp_spec_id} is not found`
          )
        }

        newProdCompSpecs.push({
          serviceComparisonId: 0,
          originSpecId: inputSpec.origin_spec_id,
          compSpecId: inputSpec.comp_spec_id,
        })
      } else {
        throw new UnprocessableEntityException('There is duplicate specs')
      }
    }

    serviceComparison.serviceId = service.id
    serviceComparison.compServiceId = compServiceId

    await serviceComparison.save()

    newProdCompSpecs.forEach(
      (_, i) => (newProdCompSpecs[i].serviceComparisonId = serviceComparisonId)
    )

    await ServiceCompSpec.createMany(newProdCompSpecs)

    await serviceComparison.load('service', (service) => {
      service.preload('thumbnail')
    })
    await serviceComparison.load('specs', (specs) => {
      specs.preload('originSpec')
      specs.preload('compSpec')
    })

    return serviceComparison
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

    await bouncer.with('ServiceComparisonPolicy').authorize('delete', service)

    const serviceComparisonId = request.param('id')

    const serviceComparison = await ServiceComparison.query()
      .where('id', serviceComparisonId)
      .andWhere('serviceId', service.id)
      .first()

    if (!serviceComparison) {
      throw new NotFoundException('Service Comparison is not found')
    }

    await serviceComparison.delete()

    return {
      message: `SUCCESS: Service Comparison deleted`,
      code: 'SUCCESS',
    }
  }
}
