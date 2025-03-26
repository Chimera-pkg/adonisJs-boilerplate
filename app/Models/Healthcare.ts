import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import User from './User'
import FileUpload from './FileUpload'
import Country from './Country'
import IndustryCategory from './IndustryCategory'

export default class Healthcare extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public name: string

  @column()
  public description: string

  @column()
  public countryId: number

  @belongsTo(() => Country, {
    foreignKey: 'countryId',
  })
  public country: BelongsTo<typeof Country>

  @column()
  public address: string

  @column()
  public industryCategoryId: number

  @belongsTo(() => IndustryCategory, {
    foreignKey: 'industryCategoryId',
    serializeAs: 'industry_category',
  })
  public industryCategory: BelongsTo<typeof IndustryCategory>

  @column({ serializeAs: null })
  public userId: number

  @column({ serializeAs: null })
  public logoId: number

  @column({ serializeAs: null })
  public categoryIdOne: number

  @column({ serializeAs: null })
  public categoryIdTwo: number

  @belongsTo(() => User)
  public user: BelongsTo<typeof User>

  @belongsTo(() => FileUpload, { foreignKey: 'logoId' })
  public logo: BelongsTo<typeof FileUpload>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
