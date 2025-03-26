import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import RiskClassification from 'App/Models/RiskClassification'

export default class RiskClassificationSeeder extends BaseSeeder {
  public async run() {
    const uniqueKey = 'id'

    await RiskClassification.updateOrCreateMany(uniqueKey, [
      {
        id: 1,
        name: 'Class A',
      },
      {
        id: 2,
        name: 'Class B',
      },
      {
        id: 3,
        name: 'Class C',
      },
      {
        id: 4,
        name: 'Class D',
      },
      {
        id: 5,
        name: 'Not Sure',
      },
    ])
  }
}
