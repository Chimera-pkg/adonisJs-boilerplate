import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import RegulatoryAgency from 'App/Models/RegulatoryAgency'

export default class RegulatoryAgencySeeder extends BaseSeeder {
  public async run() {
    const uniqueKey = 'id'

    await RegulatoryAgency.updateOrCreateMany(uniqueKey, [
      {
        id: 1,
        name: 'Australia Therapeutic Goods Adnubustratuib',
      },
      {
        id: 2,
        name: 'European Union Notified Bodies for Class B',
      },
      {
        id: 3,
        name: 'Health Canada',
      },
      {
        id: 4,
        name: 'Japan Ministry of Health, Labour and Welfare',
      },
      {
        id: 5,
        name: 'Us Food and Drug Administration',
      },
      {
        id: 6,
        name: 'Other',
      },
    ])
  }
}
