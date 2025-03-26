import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import SpecimenType from 'App/Models/SpecimenType'

export default class SpecimenTypeSeeder extends BaseSeeder {
  public async run() {
    const uniqueKey = 'id'

    await SpecimenType.updateOrCreateMany(uniqueKey, [
      {
        id: 1,
        name: 'Blood and blood fractions (plasma, serum, buffy coat, redblood cells)',
      },
      {
        id: 2,
        name: 'Tissue (from surgery, autopsy, transplant)',
      },
      {
        id: 3,
        name: 'Urine',
      },
      {
        id: 4,
        name: 'Saliva/buccal cells',
      },
      {
        id: 5,
        name: 'Placental tissue, meconium, cord blood',
      },
      {
        id: 6,
        name: 'Bone marrow',
      },
      {
        id: 7,
        name: 'Breast milk',
      },
      {
        id: 8,
        name: 'Bronchoalveolar lavage',
      },
      {
        id: 9,
        name: 'Cell lines',
      },
      {
        id: 10,
        name: 'Exhaled air',
      },
      {
        id: 11,
        name: 'Feces',
      },
      {
        id: 12,
        name: 'Fluids from cytology (ascites, pleural fluid, synovial fluid, etc.)',
      },
      {
        id: 13,
        name: 'Hair',
      },
      {
        id: 14,
        name: 'Nail clippings',
      },
      {
        id: 15,
        name: 'Semen',
      },
    ])
  }
}
