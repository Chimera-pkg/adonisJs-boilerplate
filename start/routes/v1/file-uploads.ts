import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
  Route.resource('file-uploads', 'FileUploadsController').only(['index', 'store', 'show'])
}).prefix('v1')
