import { Exception } from '@adonisjs/core/build/standalone'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

/*
|--------------------------------------------------------------------------
| Exception
|--------------------------------------------------------------------------
|
| The Exception class imported from `@adonisjs/core` allows defining
| a status code and error code for every exception.
|
| @example
| new UnprocessableEntityException('message', 500, 'E_RUNTIME_EXCEPTION')
|
*/
export default class UnprocessableEntityException extends Exception {
  constructor(
    message = 'Unprocessable Entity',
    errors = [],
    status = 422,
    code = 'E_UNPROCESSABLE_ENTITY'
  ) {
    super(message, status, code)
    this.errors = errors
    this.message = message
  }
  public errors?: any[]
  public message: string

  public async handle(error: any, ctx: HttpContextContract) {
    if (process.env.NODE_ENV === 'development') {
      ctx.response.status(error.status).send({
        message: error.message,
        errors: error.errors,
        stack: error.stack,
        code: error.code,
      })
      return
    }

    ctx.response.status(error.status).json({
      message: error.message,
      errors: error.errors,
    })
  }
}
