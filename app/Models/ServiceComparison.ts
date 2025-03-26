import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, belongsTo, column, HasMany, hasMany } from '@ioc:Adonis/Lucid/Orm'
import Service from './Service'
import ServiceCompSpec from './ServiceCompSpec'

export default class ServiceComparison extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column({ serializeAs: null })
  public serviceId: number

  @belongsTo(() => Service, {
    foreignKey: 'serviceId',
  })
  public service: BelongsTo<typeof Service>

  @column({ serializeAs: null })
  public compServiceId: number

  @belongsTo(() => Service, {
    foreignKey: 'compServiceId',
    serializeAs: 'comp_service',
  })
  public compService: BelongsTo<typeof Service>

  @hasMany(() => ServiceCompSpec)
  public specs: HasMany<typeof ServiceCompSpec>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
