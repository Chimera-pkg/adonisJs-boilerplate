import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
  Route.group(() => {
    Route.get('/profile', 'HealthcaresController.getProfile')
    Route.put('/profile', 'HealthcaresController.updateProfile')
  }).prefix('healthcare')
}).prefix('v1')
