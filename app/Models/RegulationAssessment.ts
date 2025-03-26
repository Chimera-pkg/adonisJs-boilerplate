import { DateTime } from 'luxon'
import {
  BaseModel,
  BelongsTo,
  belongsTo,
  column,
  ManyToMany,
  manyToMany,
} from '@ioc:Adonis/Lucid/Orm'
import Manufacturer from './Manufacturer'
import Country from './Country'
import FileUpload from './FileUpload'
import SpecimenType from './SpecimenType'
import RegulatoryAgency from './RegulatoryAgency'
import DaelerType from './DaelerType'
import RiskClassification from './RiskClassification'

export enum RegulationAssessmentStatusEnum {
  SUBMITTED = 'submitted',
  FEASEBLE = 'feasible',
  NOTFEASIBLE = 'not_feasible',
}

export default class RegulationAssessment extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column({ serializeAs: null })
  public manufacturerId: number

  @belongsTo(() => Manufacturer, {
    foreignKey: 'manufacturerId',
  })
  public manufacturer: BelongsTo<typeof Manufacturer>

  @column({ serializeAs: null })
  public countryId: number

  @belongsTo(() => Country, {
    foreignKey: 'countryId',
  })
  public country: BelongsTo<typeof Country>

  @column({ serializeAs: null })
  public riskClassificationId: number

  @belongsTo(() => RiskClassification, {
    foreignKey: 'riskClassificationId',
    serializeAs: 'risk_classification',
  })
  public riskClassification: BelongsTo<typeof RiskClassification>

  @column({ serializeAs: null })
  public importerLicenseId: number

  @belongsTo(() => FileUpload, {
    foreignKey: 'importerLicenseId',
    serializeAs: 'importer_license',
  })
  public importerLicense: BelongsTo<typeof FileUpload>

  @column({ serializeAs: null })
  public wholesalerLicenseId: number

  @belongsTo(() => FileUpload, {
    foreignKey: 'wholesalerLicenseId',
    serializeAs: 'wholesaler_license',
  })
  public wholesalerLicense: BelongsTo<typeof FileUpload>

  @column({ serializeAs: null })
  public manufacturerLicenseId: number

  @belongsTo(() => FileUpload, {
    foreignKey: 'manufacturerLicenseId',
    serializeAs: 'manufacturer_license',
  })
  public manufacturerLicense: BelongsTo<typeof FileUpload>

  @column()
  public productOwner: number

  @column()
  public deviceLabel: number

  @column()
  public deviceIdentitier: number

  @column()
  public intendedPurpose: number

  @manyToMany(() => RegulatoryAgency, {
    pivotTable: 'regulation_assessment_agencies',
    pivotForeignKey: 'regulation_assessment_id',
    pivotRelatedForeignKey: 'regulatory_agency_id',
    serializeAs: 'regulatory_agencies',
  })
  public regulatoryAgencies: ManyToMany<typeof RegulatoryAgency>

  // @hasManyThrough([() => RegulatoryAgency, () => Regulation])
  // public regulatoryAgencies:

  @manyToMany(() => DaelerType, {
    pivotTable: 'regulation_assessment_daeler_types',
    pivotForeignKey: 'reg_assessment_id',
    pivotRelatedForeignKey: 'daeler_type_id',
    serializeAs: 'daeler_types',
  })
  public daelerTypes: ManyToMany<typeof DaelerType>

  @column({ serializeAs: null })
  public specimenTypeId: number

  @belongsTo(() => SpecimenType, {
    foreignKey: 'specimenTypeId',
    serializeAs: 'specimen_type',
  })
  public specimenType: BelongsTo<typeof SpecimenType>

  @column({ serializeAs: null })
  public testingReportId: number

  @belongsTo(() => FileUpload, {
    foreignKey: 'testingReportId',
    serializeAs: 'testing_report',
  })
  public testingReport: BelongsTo<typeof FileUpload>

  @column({ serializeAs: null })
  public userManualId: number

  @belongsTo(() => FileUpload, {
    foreignKey: 'userManualId',
    serializeAs: 'user_manual',
  })
  public userManual: BelongsTo<typeof FileUpload>

  @column({ serializeAs: null })
  public medicalLicenseId: number

  @belongsTo(() => FileUpload, {
    foreignKey: 'medicalLicenseId',
    serializeAs: 'medical_license',
  })
  public medicalLicense: BelongsTo<typeof FileUpload>

  @column()
  public status: RegulationAssessmentStatusEnum

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
