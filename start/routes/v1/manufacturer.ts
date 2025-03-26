import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
  Route.group(() => {
    Route.get('/profile', 'ManufacturersController.getProfile')
    Route.put('/profile', 'ManufacturersController.updateProfile')
  })
    .prefix('manufacturer')
    .middleware(['auth:api'])
}).prefix('v1')
