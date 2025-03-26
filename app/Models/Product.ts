import { DateTime } from 'luxon'
import {
  BaseModel,
  BelongsTo,
  belongsTo,
  column,
  HasMany,
  hasMany,
  ManyToMany,
  manyToMany,
  scope,
} from '@ioc:Adonis/Lucid/Orm'
import { slugify } from '@ioc:Adonis/Addons/LucidSlugify'
import ProductCategory from './ProductCategory'
import Manufacturer from './Manufacturer'
import FileUpload from './FileUpload'
import User from './User'
import ProductSpecification from './ProductSpecification'
import ProductClinicalApplication from './ProductClinicalApplication'
import ProductMedia from './ProductMedia'
import ProductComparison from './ProductComparison'
import ProductQA from './ProductQA'
import ProductUserManual from './ProductUserManual'
import ProductWorkflow from './ProductWorkflow'
import Tag from './Tag'

export default class Product extends BaseModel {
  public static visibleTo = scope((query, user: User | undefined) => {
    // non login user can only view published product
    if (!user) {
      query.where('isPublished', true)
      return
    }

    // manufacturer user can only view their owns's products
    if (user.isManufacturer()) {
      query.where('manufacturerId', user.manufacturer.id)
    }
  })

  @column({ isPrimary: true })
  public id: number

  @column()
  public name: string

  @column()
  @slugify({
    strategy: 'simple',
    fields: ['name'],
  })
  public slug: string

  @column()
  public description: string

  @column({
    serialize: (value?: Number) => {
      return Boolean(value)
    },
  })
  public isPublished: boolean

  @column({ serializeAs: null })
  public categoryId: number

  @column({ serializeAs: null })
  public manufacturerId: number

  @column({ serializeAs: null })
  public thumbnailId: number

  @belongsTo(() => FileUpload, {
    foreignKey: 'thumbnailId',
  })
  public thumbnail: BelongsTo<typeof FileUpload>

  @belongsTo(() => ProductCategory, {
    foreignKey: 'categoryId',
  })
  public category: BelongsTo<typeof ProductCategory>

  @belongsTo(() => Manufacturer)
  public manufacturer: BelongsTo<typeof Manufacturer>

  @hasMany(() => ProductMedia)
  public media: HasMany<typeof ProductMedia>

  @hasMany(() => ProductSpecification)
  public specifications: HasMany<typeof ProductSpecification>

  @hasMany(() => ProductClinicalApplication, { serializeAs: 'clinical_applications' })
  public clinicalApplications: HasMany<typeof ProductClinicalApplication>

  @hasMany(() => ProductComparison)
  public comparisons: HasMany<typeof ProductComparison>

  @hasMany(() => ProductQA, { serializeAs: 'question_answers' })
  public questionAnswers: HasMany<typeof ProductQA>

  @hasMany(() => ProductUserManual, { serializeAs: 'user_manuals' })
  public userManuals: HasMany<typeof ProductUserManual>

  @hasMany(() => ProductWorkflow)
  public workflows: HasMany<typeof ProductWorkflow>

  @manyToMany(() => Tag, {
    pivotTable: 'product_tags',
    pivotForeignKey: 'product_id',
    pivotRelatedForeignKey: 'tag_id',
  })
  public tags: ManyToMany<typeof Tag>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
