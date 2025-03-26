import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Country from 'App/Models/Country'

export default class CountriesController {
  public async index({ request }: HttpContextContract) {
    const page = request.input('page', 1)
    const limit = request.input('limit', 10)

    const countries = await Country.query().paginate(page, limit)

    countries.baseUrl('/countries')

    return countries
  }

  public async show({ params }: HttpContextContract) {
    const country = await Country.findOrFail(params.id)

    return country
  }
}
