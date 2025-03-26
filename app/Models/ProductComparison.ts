import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, belongsTo, column, HasMany, hasMany } from '@ioc:Adonis/Lucid/Orm'
import Product from './Product'
import ProductCompSpec from './ProductCompSpec'

export default class ProductComparison extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column({ serializeAs: null })
  public productId: number

  @column({ serializeAs: null })
  public compProductId: number

  @belongsTo(() => Product, {
    foreignKey: 'productId',
  })
  public product: BelongsTo<typeof Product>

  @belongsTo(() => Product, {
    foreignKey: 'compProductId',
    serializeAs: 'comp_product',
  })
  public compProduct: BelongsTo<typeof Product>

  @hasMany(() => ProductCompSpec)
  public specs: HasMany<typeof ProductCompSpec>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
