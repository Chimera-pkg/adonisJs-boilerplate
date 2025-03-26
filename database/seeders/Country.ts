import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import Country from 'App/Models/Country'

type CountryRaw = {
  name: string
  dial_code: string
  code: string
}

type CountryFormatted = {
  id: number
  name: string
  iso: string
  phoneCode: string
}

const countries: CountryRaw[] = require('../data/Country.json')

export default class CountrySeeder extends BaseSeeder {
  public async run() {
    const formatedCountries: CountryFormatted[] = countries.map((country, i) => ({
      id: i + 1,
      name: country.name,
      iso: country.code,
      phoneCode: country.dial_code,
    }))

    const uniqueKey = 'iso'

    await Country.updateOrCreateMany(uniqueKey, formatedCountries)
  }
}
