import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, belongsTo, column, scope } from '@ioc:Adonis/Lucid/Orm'
import { slugify } from '@ioc:Adonis/Addons/LucidSlugify'
import FileUpload from './FileUpload'
import User from './User'
import Country from './Country'

export default class GovAffair extends BaseModel {
  public static visibleTo = scope((query, user: User | undefined) => {
    // only admin can see all gov affairs
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
  @slugify({
    strategy: 'shortId',
    fields: ['title'],
  })
  public slug: string

  @column()
  public content: string

  @column({ serializeAs: null })
  public countryId: number

  @column({
    serialize: (value?: Number) => {
      return Boolean(value)
    },
  })
  public isPublished: boolean

  @column({ serializeAs: null })
  public imageId: number

  @belongsTo(() => Country, {
    foreignKey: 'countryId',
  })
  public country: BelongsTo<typeof Country>

  @belongsTo(() => FileUpload, {
    foreignKey: 'imageId',
  })
  public image: BelongsTo<typeof FileUpload>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
