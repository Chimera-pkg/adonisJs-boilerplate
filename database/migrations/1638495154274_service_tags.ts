import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class ServiceTags extends BaseSchema {
  protected tableName = 'service_tags'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table
        .integer('service_id')
        .unsigned()
        .references('services.id')
        .onDelete('CASCADE')
        .onUpdate('CASCADE')
      table
        .integer('tag_id')
        .unsigned()
        .references('tags.id')
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
