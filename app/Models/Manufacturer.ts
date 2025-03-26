import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import User from './User'
import FileUpload from './FileUpload'
import ProductCategory from './ProductCategory'
import Country from './Country'
import IndustryCategory from './IndustryCategory'

export default class Manufacturer extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public name: string

  @column()
  public picName: string

  @column()
  public description: string

  @column({ serializeAs: null })
  public countryId: number

  @belongsTo(() => Country, {
    foreignKey: 'countryId',
  })
  public country: BelongsTo<typeof Country>

  @column()
  public address: string

  @column({ serializeAs: null })
  public industryCategoryId: number

  @belongsTo(() => IndustryCategory, {
    foreignKey: 'industryCategoryId',
    serializeAs: 'industry_category',
  })
  public industryCategory: BelongsTo<typeof IndustryCategory>

  @column()
  public website: string

  @column()
  public video: string

  @column()
  public about: string

  @column({ serializeAs: null })
  public userId: number

  @column({ serializeAs: null })
  public logoId: number

  @column({ serializeAs: null })
  public profileFileId: number

  @column({ serializeAs: null })
  public categoryIdOne: number

  @column({ serializeAs: null })
  public categoryIdTwo: number

  @belongsTo(() => User)
  public user: BelongsTo<typeof User>

  @belongsTo(() => FileUpload, { foreignKey: 'logoId' })
  public logo: BelongsTo<typeof FileUpload>

  @belongsTo(() => FileUpload, { foreignKey: 'profileFileId', serializeAs: 'profile_file' })
  public profileFile: BelongsTo<typeof FileUpload>

  @belongsTo(() => ProductCategory, { foreignKey: 'categoryIdOne', serializeAs: 'category_one' })
  public categoryOne: BelongsTo<typeof ProductCategory>

  @belongsTo(() => ProductCategory, { foreignKey: 'categoryIdTwo', serializeAs: 'category_two' })
  public categoryTwo: BelongsTo<typeof ProductCategory>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
