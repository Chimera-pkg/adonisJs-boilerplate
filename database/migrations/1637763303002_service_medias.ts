import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class ServiceMedias extends BaseSchema {
  protected tableName = 'service_medias'

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
      table.string('name').notNullable()
      table.string('url').notNullable()
      table.enum('type', ['image', 'video', '3d']).notNullable()

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
