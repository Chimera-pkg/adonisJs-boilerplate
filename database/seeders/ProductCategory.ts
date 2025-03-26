import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import ProductCategory from 'App/Models/ProductCategory'

export default class ProductCategorySeeder extends BaseSeeder {
  public async run() {
    const uniqueKey = 'id'

    await ProductCategory.updateOrCreateMany(uniqueKey, [
      {
        id: 1,
        name: 'Medical equipment',
      },
      {
        id: 2,
        name: 'Medical consumables',
      },
      {
        id: 3,
        name: 'Molecular diagnostic instrument and kits',
      },
      {
        id: 4,
        name: 'Immunohistochemistry',
      },
      {
        id: 5,
        name: 'Imaging and diagnostics',
      },
      {
        id: 6,
        name: 'Physiotherapy/rehabilitation',
      },
      {
        id: 7,
        name: 'Laboratory furniture',
      },
    ])
  }
}
