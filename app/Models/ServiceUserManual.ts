import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import FileUpload from './FileUpload'
import Service from './Service'

export default class ServiceUserManual extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column({ serializeAs: null })
  public fileId: number

  @belongsTo(() => FileUpload, {
    foreignKey: 'fileId',
  })
  public file: BelongsTo<typeof FileUpload>

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
