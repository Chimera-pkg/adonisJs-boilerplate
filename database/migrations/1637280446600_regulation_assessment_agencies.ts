import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class RegulationAssessmentAgencies extends BaseSchema {
  protected tableName = 'regulation_assessment_agencies'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table
        .integer('regulation_assessment_id')
        .unsigned()
        .references('regulation_assessments.id')
        .onDelete('CASCADE')
        .onUpdate('CASCADE')
      table
        .integer('regulatory_agency_id')
        .unsigned()
        .references('regulatory_agencies.id')
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
