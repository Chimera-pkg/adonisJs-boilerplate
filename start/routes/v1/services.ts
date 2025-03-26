import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
  /**
   * Services Routes
   */
  Route.resource('services', 'ServicesController').middleware({
    store: ['auth:api'],
    destroy: ['auth:api'],
    update: ['auth:api'],
  })

  /**
   * Service Media Routes
   */
  Route.resource('services.media', 'ServiceMediasController')
    .only(['index', 'store', 'destroy'])
    .middleware({
      store: ['auth:api'],
      destroy: ['auth:api'],
    })

  /**
   * Service User Manuals Routes
   */
  Route.resource('services.user-manuals', 'ServiceUserManualsController')
    .only(['index', 'store', 'destroy'])
    .middleware({
      store: ['auth:api'],
      destroy: ['auth:api'],
    })

  /**
   * Service Question Answers Routes
   */
  Route.resource('services.question-answers', 'ServiceQAsController')
    .only(['index', 'store', 'destroy', 'update'])
    .middleware({
      store: ['auth:api'],
      destroy: ['auth:api'],
      update: ['auth:api'],
    })

  /**
   * Service Workflows Routes
   */
  Route.resource('services.workflows', 'ServiceWorkflowsController')
    .only(['index', 'store', 'destroy', 'update'])
    .middleware({
      store: ['auth:api'],
      destroy: ['auth:api'],
      update: ['auth:api'],
    })

  /**
   * Service Specifications Routes
   */
  Route.resource('services.specifications', 'ServiceSpecificationsController')
    .only(['index', 'store', 'destroy', 'update'])
    .middleware({
      store: ['auth:api'],
      destroy: ['auth:api'],
      update: ['auth:api'],
    })

  /**
   * Service Clinical Applications Routes
   */
  Route.resource('services.clinical-applications', 'ServiceClinicalApplicationsController')
    .only(['index', 'store', 'destroy', 'update'])
    .middleware({
      store: ['auth:api'],
      destroy: ['auth:api'],
      update: ['auth:api'],
    })

  /**
   * Service Comparisons Routes
   */
  Route.resource('services.comparisons', 'ServiceComparisonsController')
    .only(['index', 'store', 'destroy', 'update'])
    .middleware({
      store: ['auth:api'],
      destroy: ['auth:api'],
      update: ['auth:api'],
    })
}).prefix('v1')
