import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class RegulationServiceCategories extends BaseSchema {
  protected tableName = 'regulation_service_categories'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('name')
      table.string('description')

      /**
       * Creates created_at and updated_at
       * Set the default value to "CURRENT_TIMESTAMP"
       */
      table.timestamps(true, true)
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
