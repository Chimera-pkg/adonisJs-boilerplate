import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class ProductWorkflows extends BaseSchema {
  protected tableName = 'product_workflows'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table
        .integer('product_id')
        .unsigned()
        .references('products.id')
        .notNullable()
        .onDelete('CASCADE')
        .onUpdate('CASCADE')
      table.integer('seq').unsigned().notNullable()
      table.string('title').notNullable()
      table.text('description').notNullable()

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
