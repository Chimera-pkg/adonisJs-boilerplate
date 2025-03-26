import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import ProductComparison from './ProductComparison'
import ProductSpecification from './ProductSpecification'

export default class ProductCompSpec extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column({ serializeAs: null })
  public productComparisonId: number

  @column({ serializeAs: null })
  public originSpecId: number

  @column({ serializeAs: null })
  public compSpecId: number

  @belongsTo(() => ProductComparison, {
    foreignKey: 'productComparisonId',
    serializeAs: 'product_comparison',
  })
  public productComparison: BelongsTo<typeof ProductComparison>

  @belongsTo(() => ProductSpecification, {
    foreignKey: 'originSpecId',
    serializeAs: 'origin_spec',
  })
  public originSpec: BelongsTo<typeof ProductSpecification>

  @belongsTo(() => ProductSpecification, {
    foreignKey: 'compSpecId',
    serializeAs: 'comp_spec',
  })
  public compSpec: BelongsTo<typeof ProductSpecification>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
