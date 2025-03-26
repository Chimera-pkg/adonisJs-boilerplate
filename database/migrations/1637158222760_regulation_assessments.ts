import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class RegulationAssessments extends BaseSchema {
  protected tableName = 'regulation_assessments'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table
        .integer('manufacturer_id')
        .unsigned()
        .references('manufacturers.id')
        .notNullable()
        .onDelete('CASCADE')
        .onUpdate('CASCADE')
      table
        .integer('risk_classification_id')
        .unsigned()
        .references('risk_classifications.id')
        .onDelete('SET NULL')
        .onUpdate('CASCADE')
      table
        .integer('country_id')
        .unsigned()
        .references('countries.id')
        .onDelete('SET NULL')
        .onUpdate('CASCADE')
      table
        .integer('importer_license_id')
        .unsigned()
        .references('file_uploads.id')
        .onDelete('SET NULL')
        .onUpdate('CASCADE')
      table
        .integer('wholesaler_license_id')
        .unsigned()
        .references('file_uploads.id')
        .onDelete('SET NULL')
        .onUpdate('CASCADE')
      table
        .integer('manufacturer_license_id')
        .unsigned()
        .references('file_uploads.id')
        .onDelete('SET NULL')
        .onUpdate('CASCADE')
      table.string('product_owner')
      table.string('device_label')
      table.string('device_identitier')
      table.string('intended_purpose')
      table
        .integer('specimen_type_id')
        .unsigned()
        .references('specimen_types.id')
        .onDelete('SET NULL')
        .onUpdate('CASCADE')
      table
        .integer('testing_report_id')
        .unsigned()
        .references('file_uploads.id')
        .onDelete('SET NULL')
        .onUpdate('CASCADE')
      table
        .integer('user_manual_id')
        .unsigned()
        .references('file_uploads.id')
        .onDelete('SET NULL')
        .onUpdate('CASCADE')
      table
        .integer('medical_license_id')
        .unsigned()
        .references('file_uploads.id')
        .onDelete('SET NULL')
        .onUpdate('CASCADE')
      table.enum('status', ['submitted', 'feasible', 'not_feasible']).notNullable()

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
