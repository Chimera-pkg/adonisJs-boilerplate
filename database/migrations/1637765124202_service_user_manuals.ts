import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class ServiceUserManuals extends BaseSchema {
  protected tableName = 'service_user_manuals'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table
        .integer('service_id')
        .unsigned()
        .references('services.id')
        .notNullable()
        .onDelete('CASCADE')
        .onUpdate('CASCADE')
      table.integer('file_id').unsigned().references('file_uploads.id').notNullable()

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
