import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
  Route.resource('countries', 'CountriesController').only(['index', 'show'])
}).prefix('v1')
