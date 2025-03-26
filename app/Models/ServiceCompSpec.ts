import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import ServiceComparison from './ServiceComparison'
import ServiceSpecification from './ServiceSpecification'

export default class ServiceCompSpec extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column({ serializeAs: null })
  public serviceComparisonId: number

  @column({ serializeAs: null })
  public originSpecId: number

  @column({ serializeAs: null })
  public compSpecId: number

  @belongsTo(() => ServiceComparison, {
    foreignKey: 'serviceComparisonId',
    serializeAs: 'service_comparison',
  })
  public serviceComparison: BelongsTo<typeof ServiceComparison>

  @belongsTo(() => ServiceSpecification, {
    foreignKey: 'originSpecId',
    serializeAs: 'origin_spec',
  })
  public originSpec: BelongsTo<typeof ServiceSpecification>

  @belongsTo(() => ServiceSpecification, {
    foreignKey: 'compSpecId',
    serializeAs: 'comp_spec',
  })
  public compSpec: BelongsTo<typeof ServiceSpecification>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
