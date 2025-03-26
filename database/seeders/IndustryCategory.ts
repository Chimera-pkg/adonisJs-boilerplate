import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import IndustryCategory from 'App/Models/IndustryCategory'

export default class IndustryCategorySeeder extends BaseSeeder {
  public async run() {
    const uniqueKey = 'id'

    await IndustryCategory.updateOrCreateMany(uniqueKey, [
      {
        id: 1,
        name: 'Medical Enterprise and Device Manufacturer',
      },
      {
        id: 2,
        name: 'Solution and Services Provider',
      },
    ])
  }
}
