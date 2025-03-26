import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import MarketingServiceCategory from 'App/Models/MarketingServiceCategory'

export default class MarketingServiceCategorySeeder extends BaseSeeder {
  public async run() {
    const uniqueKey = 'id'

    await MarketingServiceCategory.updateOrCreateMany(uniqueKey, [
      {
        id: 1,
        name: 'Product Marketing Analysys Report',
        description: 'Product Marketing Analysys Report',
      },
      {
        id: 2,
        name: 'Marketing Services',
        description: 'Marketing Services',
      },
      {
        id: 3,
        name: 'Local Partner',
        description: 'Local Partner',
      },
      {
        id: 4,
        name: 'Logistic & Storage',
        description: 'Logistic & Storage',
      },
    ])
  }
}
