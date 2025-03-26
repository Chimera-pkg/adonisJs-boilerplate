import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class RegulationAssessmentDaelerTypes extends BaseSchema {
  protected tableName = 'regulation_assessment_daeler_types'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table
        .integer('reg_assessment_id')
        .unsigned()
        .references('regulation_assessments.id')
        .onDelete('CASCADE')
        .onUpdate('CASCADE')
      table
        .integer('daeler_type_id')
        .unsigned()
        .references('daeler_types.id')
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
