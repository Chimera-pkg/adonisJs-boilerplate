import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import ServiceCategory from 'App/Models/ServiceCategory'

export default class ServiceCategorySeeder extends BaseSeeder {
  public async run() {
    const uniqueKey = 'id'

    await ServiceCategory.updateOrCreateMany(uniqueKey, [
      {
        id: 1,
        name: 'Launch New COVID Test Lab',
      },
      {
        id: 2,
        name: 'Lab information systems',
      },
      {
        id: 3,
        name: 'Healthcare compliance',
      },
      {
        id: 4,
        name: 'Clinical Validation Serices',
      },
      {
        id: 5,
        name: 'Iso 13485/15189 Regulations',
      },
      {
        id: 6,
        name: 'Lab Data Analysis',
      },
      {
        id: 7,
        name: 'Logistic & Storage',
      },
    ])
  }
}
