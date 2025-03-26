import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import Service from './Service'

export default class ServiceWorkflow extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public seq: number

  @column()
  public title: string

  @column()
  public description: string

  @column({ serializeAs: null })
  public serviceId: number

  @belongsTo(() => Service, {
    foreignKey: 'serviceId',
  })
  public service: BelongsTo<typeof Service>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
