import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Products extends BaseSchema {
  protected tableName = 'products'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('name').notNullable()
      table.string('slug').unique().notNullable()
      table.text('description')
      table.boolean('is_published').defaultTo(false)
      table
        .integer('thumbnail_id')
        .unsigned()
        .references('file_uploads.id')
        .onDelete('SET NULL')
        .onUpdate('CASCADE')
      table
        .integer('category_id')
        .unsigned()
        .references('product_categories.id')
        .onDelete('SET NULL')
        .onUpdate('CASCADE')
      table
        .integer('manufacturer_id')
        .unsigned()
        .references('manufacturers.id')
        .notNullable()
        .onDelete('CASCADE')
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
