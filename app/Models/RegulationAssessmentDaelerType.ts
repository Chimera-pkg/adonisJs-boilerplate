import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import RegulationAssessment from './RegulationAssessment'
import DaelerType from './DaelerType'

export default class RegulationAssessmentDaelerType extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column({ serializeAs: null })
  public regAssessmentId: number

  @belongsTo(() => RegulationAssessment, {
    foreignKey: 'regAssessmentId',
  })
  public regulationAssessment: BelongsTo<typeof RegulationAssessment>

  @column({ serializeAs: null })
  public daelerTypeId: number

  @belongsTo(() => DaelerType, {
    foreignKey: 'daelerTypeId',
  })
  public daelerType: BelongsTo<typeof DaelerType>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
