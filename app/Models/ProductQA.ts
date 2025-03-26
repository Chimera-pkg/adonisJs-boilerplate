import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import Product from './Product'

export default class ProductQA extends BaseModel {
  public static table = 'product_question_answers'

  @column({ isPrimary: true })
  public id: number

  @column()
  public question: string

  @column()
  public answer: string

  @column({ serializeAs: null })
  public productId: number

  @belongsTo(() => Product, {
    foreignKey: 'productId',
  })
  public product: BelongsTo<typeof Product>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
