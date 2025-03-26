import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
  Route.resource('industry-categories', 'IndustryCategoriesController').middleware({
    store: ['auth:api'],
    destroy: ['auth:api'],
    update: ['auth:api'],
  })
}).prefix('v1')
