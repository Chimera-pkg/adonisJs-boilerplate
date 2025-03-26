import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class ProductCompSpecs extends BaseSchema {
  protected tableName = 'product_comp_specs'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table
        .integer('product_comparison_id')
        .unsigned()
        .references('product_comparisons.id')
        .notNullable()
        .onDelete('CASCADE')
        .onUpdate('CASCADE')
      table
        .integer('origin_spec_id')
        .unsigned()
        .references('product_specifications.id')
        .notNullable()
        .onDelete('CASCADE')
        .onUpdate('CASCADE')
      table
        .integer('comp_spec_id')
        .unsigned()
        .references('product_specifications.id')
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
