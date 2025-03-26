import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
  Route.resource('regulation-assessments', 'RegulationAssessmentsController').only([
    'index',
    'show',
    'store',
    'update',
  ])
})
  .prefix('v1')
  .middleware(['auth:api'])
