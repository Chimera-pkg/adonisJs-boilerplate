import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import RegulationServiceCategory from 'App/Models/RegulationServiceCategory'

export default class RegulationServiceCategorySeeder extends BaseSeeder {
  public async run() {
    const uniqueKey = 'id'

    await RegulationServiceCategory.updateOrCreateMany(uniqueKey, [
      {
        id: 1,
        name: 'Regulatory Roadmap',
        description: 'Regulatory Roadmap',
      },
      {
        id: 2,
        name: 'Product Registration',
        description: 'Product Registration',
      },
      {
        id: 3,
        name: 'Clinical Trials',
        description: 'Clinical Trials',
      },
    ])
  }
}
