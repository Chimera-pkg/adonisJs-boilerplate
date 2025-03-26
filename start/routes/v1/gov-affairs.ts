import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
  Route.resource('gov-affairs', 'GovAffairsController').middleware({
    store: ['auth:api'],
    destroy: ['auth:api'],
    update: ['auth:api'],
  })
}).prefix('v1')
