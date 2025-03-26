import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class LabTests extends BaseSchema {
  protected tableName = 'lab_tests'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('patient_name').notNullable()
      table.string('test_case_id').notNullable()
      table.string('physician_name').notNullable()
      table.string('disease').notNullable()
      table.string('specimen_type').notNullable()
      table.string('report_status').notNullable()

      // Add timestamps
      table.timestamps(true, true)

      // Add soft delete column
      table.timestamp('deleted_at', { useTz: true }).nullable()
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}