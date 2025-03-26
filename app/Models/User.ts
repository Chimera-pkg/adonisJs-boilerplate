import { DateTime } from 'luxon'
import Hash from '@ioc:Adonis/Core/Hash'
import { column, beforeSave, BaseModel, hasOne, HasOne } from '@ioc:Adonis/Lucid/Orm'
import Manufacturer from './Manufacturer'
import Healthcare from './Healthcare'

export enum UserRole {
  admin = 'admin',
  manufacturer = 'manufacturer',
  healthcare = 'healthcare',
}
export default class User extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public email: string

  @column()
  public username: string

  @column({ serializeAs: null })
  public password: string

  @column({ serializeAs: null })
  public rememberMeToken?: string

  @column({
    serialize: (value?: Number) => {
      return Boolean(value)
    },
  })
  public isVerified: boolean

  @column()
  public role: UserRole

  @hasOne(() => Manufacturer)
  public manufacturer: HasOne<typeof Manufacturer>

  @hasOne(() => Healthcare)
  public healthcare: HasOne<typeof Healthcare>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @beforeSave()
  public static async hashPassword(user: User) {
    if (user.$dirty.password) {
      user.password = await Hash.make(user.password)
    }
  }

  public isManufacturer = () => this.role === UserRole.manufacturer
  public isHealthcare = () => this.role === UserRole.healthcare
  public isAdmin = () => this.role === UserRole.admin
}
