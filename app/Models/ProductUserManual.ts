import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import Product from './Product'
import FileUpload from './FileUpload'
export default class ProductUserManual extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column({ serializeAs: null })
  public fileId: number

  @column({ serializeAs: null })
  public productId: number

  @belongsTo(() => FileUpload, {
    foreignKey: 'fileId',
  })
  public file: BelongsTo<typeof FileUpload>

  @belongsTo(() => Product, {
    foreignKey: 'productId',
  })
  public product: BelongsTo<typeof Product>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
