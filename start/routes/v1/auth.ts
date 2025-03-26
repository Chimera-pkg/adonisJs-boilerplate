import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
  Route.group(() => {
    Route.post('/login', 'AuthController.login')
    Route.post('/google/manufacturer', 'AuthController.loginManufacturerWithGoogle')
    Route.post('/google/healthcare', 'AuthController.loginHealthcareWithGoogle')

    Route.post('/register/admin', 'AuthController.registerAdmin')
    Route.post('/register/manufacturer', 'AuthController.registerManufacturer')
    Route.post('/register/healthcare', 'AuthController.registerHealthcare')
    Route.post('/register/send-email-verification', 'AuthController.sendEmailVerification')

    Route.get('/verify/:email', 'AuthController.verifyEmail').as('verifyEmail')

    Route.get('/connect/google', async ({ ally }) => {
      return ally.use('google').redirect()
    })

    Route.get('/connect/google/callback', async ({ ally }) => {
      const google = ally.use('google')

      /**
       * User has explicitly denied the login request
       */
      if (google.accessDenied()) {
        return 'Access was denied'
      }

      /**
       * Unable to verify the CSRF state
       */
      if (google.stateMisMatch()) {
        return 'Request expired. Retry again'
      }

      /**
       * There was an unknown error during the redirect
       */
      if (google.hasError()) {
        return google.getError()
      }

      /**
       * Finally, access the user
       */
      const user = await google.user()

      return user
    })
  }).prefix('auth')
}).prefix('v1')
