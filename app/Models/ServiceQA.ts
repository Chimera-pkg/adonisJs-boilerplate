import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import Service from './Service'

export default class ServiceQA extends BaseModel {
  public static table = 'service_question_answers'

  @column({ isPrimary: true })
  public id: number

  @column()
  public question: string

  @column()
  public answer: string

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
