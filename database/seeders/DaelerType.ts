import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import DaelerType from 'App/Models/DaelerType'

export default class DaelerTypeSeeder extends BaseSeeder {
  public async run() {
    const uniqueKey = 'id'

    await DaelerType.updateOrCreateMany(uniqueKey, [
      {
        id: 1,
        name: 'Importer',
      },
      {
        id: 2,
        name: 'Manufacturer',
      },
    ])
  }
}
