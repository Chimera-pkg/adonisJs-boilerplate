import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class MarketingServices extends BaseSchema {
  protected tableName = 'marketing_services'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('title')
      table.string('content')
      table.boolean('is_published')
      table
        .integer('image_id')
        .unsigned()
        .references('file_uploads.id')
        .onDelete('SET NULL')
        .onUpdate('CASCADE')
      table
        .integer('category_id')
        .unsigned()
        .references('regulation_service_categories.id')
        .onDelete('CASCADE')
        .onUpdate('CASCADE')
      table
        .integer('country_id')
        .unsigned()
        .references('countries.id')
        .onDelete('SET NULL')
        .onUpdate('CASCADE')

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
