import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import Service from './Service'
import Tag from './Tag'

export default class ServiceTag extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public serviceId: number

  @belongsTo(() => Service, {
    foreignKey: 'serviceId',
  })
  public product: BelongsTo<typeof Service>

  @column()
  public tagId: number

  @belongsTo(() => Tag, {
    foreignKey: 'tagId',
  })
  public tag: BelongsTo<typeof Tag>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
