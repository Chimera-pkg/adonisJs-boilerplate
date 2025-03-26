import { DateTime } from 'luxon'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class LabTest extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public patientName: string

  @column()
  public testCaseId: string

  @column()
  public physicianName: string

  @column()
  public disease: string

  @column()
  public specimenType: string

  @column()
  public reportStatus: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}