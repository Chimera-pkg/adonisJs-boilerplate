/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| This file is dedicated for defining HTTP routes. A single file is enough
| for majority of projects, however you can define routes in different
| files and just make sure to import them inside this file. For example
|
| Define routes in following two files
| ├── start/routes/cart.ts
| ├── start/routes/customer.ts
|
| and then import them inside `start/routes.ts` as follows
|
| import './routes/cart'
| import './routes/customer'
|
*/
import Route from '@ioc:Adonis/Core/Route'
import './routes/v1'

// For testing google id token
Route.get('/:token', async ({ ally, request }) => {
  const token = request.param('token')
  console.log('token', token)
  const user = await ally.use('google').userFromToken(token)
  return { hello: 'world', user, token }
})
