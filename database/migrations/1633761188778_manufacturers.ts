import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Manufactures extends BaseSchema {
  protected tableName = 'manufacturers'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('name')
      table.string('pic_name')
      table.string('description', 500)
      table
        .integer('country_id')
        .unsigned()
        .references('countries.id')
        .onDelete('SET NULL')
        .onUpdate('CASCADE')
      table.string('address')
      table
        .integer('industry_category_id')
        .unsigned()
        .references('industry_categories.id')
        .onDelete('SET NULL')
        .onUpdate('CASCADE')
      table.string('website')
      table.string('video')
      table.text('about')
      table
        .integer('user_id')
        .unsigned()
        .references('users.id')
        .notNullable()
        .onDelete('CASCADE')
        .onUpdate('CASCADE')
      table.integer('logo_id').unsigned().references('file_uploads.id')
      table.integer('profile_file_id').unsigned().references('file_uploads.id')
      table
        .integer('category_id_one')
        .unsigned()
        .references('product_categories.id')
        .onDelete('SET NULL')
        .onUpdate('CASCADE')
      table
        .integer('category_id_two')
        .unsigned()
        .references('product_categories.id')
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
