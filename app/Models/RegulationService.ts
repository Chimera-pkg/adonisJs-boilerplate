import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, belongsTo, column, scope } from '@ioc:Adonis/Lucid/Orm'
import FileUpload from './FileUpload'
import RegulationServiceCategory from './RegulationServiceCategory'
import Country from './Country'
import User from './User'

export default class RegulationService extends BaseModel {
  public static visibleTo = scope((query, user: User | undefined) => {
    // non login user and not admin can only view published requlation service
    if (!user || !user.isAdmin()) {
      query.where('isPublished', true)
      return
    }
  })

  @column({ isPrimary: true })
  public id: number

  @column()
  public title: string

  @column()
  public content: string

  @column({
    serialize: (value?: Number) => {
      return Boolean(value)
    },
  })
  public isPublished: boolean

  @column({ serializeAs: null })
  public categoryId: string

  @column({ serializeAs: null })
  public countryId: string

  @column({ serializeAs: null })
  public imageId: number

  @belongsTo(() => FileUpload, {
    foreignKey: 'imageId',
  })
  public image: BelongsTo<typeof FileUpload>

  @belongsTo(() => RegulationServiceCategory, {
    foreignKey: 'categoryId',
  })
  public category: BelongsTo<typeof RegulationServiceCategory>

  @belongsTo(() => Country, {
    foreignKey: 'countryId',
  })
  public country: BelongsTo<typeof Country>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
