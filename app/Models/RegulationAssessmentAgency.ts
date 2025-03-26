import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import RegulationAssessment from './RegulationAssessment'
import RegulatoryAgency from './RegulatoryAgency'

export default class RegulationAssessmentAgency extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column({ serializeAs: null })
  public regulationAssessmentId: number

  @belongsTo(() => RegulationAssessment, {
    foreignKey: 'regulationAssessmentId',
  })
  public regulationAssessment: BelongsTo<typeof RegulationAssessment>

  @column({ serializeAs: null })
  public regulatoryAgencyId: number

  @belongsTo(() => RegulatoryAgency, {
    foreignKey: 'regulatoryAgencyId',
  })
  public regulatoryAgency: BelongsTo<typeof RegulatoryAgency>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
