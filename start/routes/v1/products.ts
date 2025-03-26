import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
  /**
   * Products Routes
   */
  Route.resource('products', 'ProductsController').middleware({
    store: ['auth:api'],
    destroy: ['auth:api'],
    update: ['auth:api'],
  })

  /**
   * Product Media Routes
   */
  Route.resource('products.media', 'ProductMediasController')
    .only(['index', 'store', 'destroy'])
    .middleware({
      store: ['auth:api'],
      destroy: ['auth:api'],
    })

  /**
   * Product User Manuals Routes
   */
  Route.resource('products.user-manuals', 'ProductUserManualsController')
    .only(['index', 'store', 'destroy'])
    .middleware({
      store: ['auth:api'],
      destroy: ['auth:api'],
    })

  /**
   * Product Question Answers Routes
   */
  Route.resource('products.question-answers', 'ProductQAsController')
    .only(['index', 'store', 'destroy', 'update'])
    .middleware({
      store: ['auth:api'],
      destroy: ['auth:api'],
      update: ['auth:api'],
    })

  /**
   * Product Workflows Routes
   */
  Route.resource('products.workflows', 'ProductWorkflowsController')
    .only(['index', 'store', 'destroy', 'update'])
    .middleware({
      store: ['auth:api'],
      destroy: ['auth:api'],
      update: ['auth:api'],
    })

  /**
   * Product Specifications Routes
   */
  Route.resource('products.specifications', 'ProductSpecificationsController')
    .only(['index', 'store', 'destroy', 'update'])
    .middleware({
      store: ['auth:api'],
      destroy: ['auth:api'],
      update: ['auth:api'],
    })

  /**
   * Product Clinical Applications Routes
   */
  Route.resource('products.clinical-applications', 'ProductClinicalApplicationsController')
    .only(['index', 'store', 'destroy', 'update'])
    .middleware({
      store: ['auth:api'],
      destroy: ['auth:api'],
      update: ['auth:api'],
    })

  /**
   * Product Comparisons Routes
   */
  Route.resource('products.comparisons', 'ProductComparisonsController')
    .only(['index', 'store', 'destroy', 'update'])
    .middleware({
      store: ['auth:api'],
      destroy: ['auth:api'],
      update: ['auth:api'],
    })
}).prefix('v1')
