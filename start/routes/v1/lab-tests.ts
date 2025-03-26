import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
  /**
   * Lab Tests Routes
   */
  Route.resource('lab-tests', 'LabTestsController').middleware({
    store: ['auth:api'],
    destroy: ['auth:api'],
    update: ['auth:api'],
  })

}).prefix('v1')