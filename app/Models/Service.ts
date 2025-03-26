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
import User from './User'
import { slugify } from '@ioc:Adonis/Addons/LucidSlugify'
import FileUpload from './FileUpload'
import ServiceCategory from './ServiceCategory'
import Manufacturer from './Manufacturer'
import ServiceSpecification from './ServiceSpecification'
import ServiceClinicalApplication from './ServiceClinicalApplication'
import ServiceComparison from './ServiceComparison'
import ServiceQA from './ServiceQA'
import ServiceUserManual from './ServiceUserManual'
import ServiceWorkflow from './ServiceWorkflow'
import ServiceMedia from './ServiceMedia'
import Tag from './Tag'

export default class Service extends BaseModel {
  public static visibleTo = scope((query, user: User | undefined) => {
    // non login user can only view published service
    if (!user) {
      query.where('isPublished', true)
      return
    }

    // manufacturer user can only view their owns's services
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
    strategy: 'dbIncrement',
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
  public manufacturerId: number

  @belongsTo(() => Manufacturer)
  public manufacturer: BelongsTo<typeof Manufacturer>

  @column({ serializeAs: null })
  public thumbnailId: number

  @belongsTo(() => FileUpload, {
    foreignKey: 'thumbnailId',
  })
  public thumbnail: BelongsTo<typeof FileUpload>

  @column({ serializeAs: null })
  public categoryId: number

  @belongsTo(() => ServiceCategory, {
    foreignKey: 'categoryId',
  })
  public category: BelongsTo<typeof ServiceCategory>

  @hasMany(() => ServiceMedia)
  public media: HasMany<typeof ServiceMedia>

  @hasMany(() => ServiceSpecification)
  public specifications: HasMany<typeof ServiceSpecification>

  @hasMany(() => ServiceClinicalApplication, { serializeAs: 'clinical_applications' })
  public clinicalApplications: HasMany<typeof ServiceClinicalApplication>

  @hasMany(() => ServiceComparison)
  public comparisons: HasMany<typeof ServiceComparison>

  @hasMany(() => ServiceQA, { serializeAs: 'question_answers' })
  public questionAnswers: HasMany<typeof ServiceQA>

  @hasMany(() => ServiceUserManual, { serializeAs: 'user_manuals' })
  public userManuals: HasMany<typeof ServiceUserManual>

  @hasMany(() => ServiceWorkflow)
  public workflows: HasMany<typeof ServiceWorkflow>

  @manyToMany(() => Tag, {
    pivotTable: 'service_tags',
    pivotForeignKey: 'service_id',
    pivotRelatedForeignKey: 'tag_id',
  })
  public tags: ManyToMany<typeof Tag>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
