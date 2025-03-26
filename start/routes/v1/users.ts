import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
  Route.resource('users', 'UsersController')
})
  .prefix('v1')
  .middleware('auth:api')
