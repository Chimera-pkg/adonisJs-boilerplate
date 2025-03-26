import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class FileUpload extends BaseSchema {
  protected tableName = 'file_uploads'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('name').notNullable()
      table.string('extname').notNullable()
      table.string('type').notNullable()
      table.bigInteger('size').unsigned()
      table.string('path').notNullable()
      table.string('url').notNullable()

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
