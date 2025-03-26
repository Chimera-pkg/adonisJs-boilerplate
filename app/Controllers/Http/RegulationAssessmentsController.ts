import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import UnprocessableEntityException from 'App/Exceptions/UnprocessableEntityException'
import Drive from '@ioc:Adonis/Core/Drive'
import Env from '@ioc:Adonis/Core/Env'
import FileUpload from 'App/Models/FileUpload'
import Country from 'App/Models/Country'
import DaelerType from 'App/Models/DaelerType'
import Manufacturer from 'App/Models/Manufacturer'
import RegulationAssessment, {
  RegulationAssessmentStatusEnum,
} from 'App/Models/RegulationAssessment'
import RegulatoryAgency from 'App/Models/RegulatoryAgency'
import RiskClassification from 'App/Models/RiskClassification'
import SpecimenType from 'App/Models/SpecimenType'
import CreateRegulationAssessmentValidator from 'App/Validators/RegulationAssessment/CreateRegulationAssessmentValidator'
import UpdateRegulationAssessmentValidator from 'App/Validators/RegulationAssessment/UpdateRegulationAssessmentValidator'
import NotFoundException from 'App/Exceptions/NotFoundException'

export default class RegulationAssessmentsController {
  public async index({ request }: HttpContextContract) {
    const page = request.input('page', 1)
    const limit = request.input('limit', 10)

    const regulationAssessments = await RegulationAssessment.query()
      .preload('country')
      .preload('manufacturer', (loader) => {
        loader.preload('user')
      })
      .preload('importerLicense')
      .preload('manufacturerLicense')
      .preload('wholesalerLicense')
      .preload('medicalLicense')
      .preload('testingReport')
      .preload('userManual')
      .preload('riskClassification')
      .preload('specimenType')
      .preload('daelerTypes')
      .preload('regulatoryAgencies')
      .paginate(page, limit)

    regulationAssessments.baseUrl('/regulation-assessments')

    return regulationAssessments
  }

  public async store({ request, auth, bouncer }) {
    await request.validate(CreateRegulationAssessmentValidator)

    const riskClassificationId = request.input('risk_classification_id')
    const regulatoryAgencyIds: number[] = request.input('regulatory_agency_ids')
    const productOwnerName = request.input('product_owner_name')
    const nameAsDeviceLabel = request.input('name_as_device_label')
    const deviceIdentitier = request.input('device_identitier')
    const intendedPurpose = request.input('intended_purpose')
    const countryId = request.input('country_id')
    const daelerTypeIds: number[] = request.input('daeler_type_ids')
    const specimenTypeId = request.input('specimen_type_id')

    await bouncer.with('RegulationAssessmentPolicy').authorize('create')

    const user = await auth.authenticate()

    const manufacturer = await Manufacturer.findBy('userId', user.id)

    if (!manufacturer) {
      throw new UnprocessableEntityException('manufacturer_id is not found')
    }

    const riskClassification = await RiskClassification.find(riskClassificationId)

    if (!riskClassification) {
      throw new UnprocessableEntityException('Risk Classification is not found')
    }

    for (const regulatoryAgencyId of regulatoryAgencyIds) {
      const regulatoryAgency = await RegulatoryAgency.find(regulatoryAgencyId)

      if (!regulatoryAgency) {
        throw new UnprocessableEntityException(
          `Regulatory Agency with id ${regulatoryAgencyId} is not found`
        )
      }
    }

    const country = await Country.find(countryId)

    if (!country) {
      throw new UnprocessableEntityException('Country is not found')
    }

    for (const daelerTypeId of daelerTypeIds) {
      const daelerType = await DaelerType.find(daelerTypeId)

      if (!daelerType) {
        throw new UnprocessableEntityException(`Daeler Type with id ${daelerTypeId} is not found`)
      }
    }

    const specimenType = await SpecimenType.find(specimenTypeId)

    if (!specimenType) {
      throw new UnprocessableEntityException('Specimen Type is not found')
    }

    const regulationAssessment = new RegulationAssessment()

    const importerLicense = request.file('importer_license')

    if (importerLicense) {
      const subfolder = 'regulation-assessment/importer-license'

      const serverBaseUrl = Env.get('SERVER_BASEURL')

      await importerLicense.moveToDisk(subfolder)

      const path = await Drive.getUrl(`${subfolder}/${importerLicense.fileName}`)

      const url = serverBaseUrl + path

      const fileUpload = await FileUpload.create({
        name: `${subfolder}/${importerLicense.fileName}`,
        extname: importerLicense.extname,
        type: importerLicense.type,
        size: importerLicense.size,
        path,
        url,
      })

      regulationAssessment.importerLicenseId = fileUpload.id
    }

    const wholesalerLicense = request.file('wholesaler_license')

    if (wholesalerLicense) {
      const subfolder = 'regulation-assessment/wholesaler-license'

      const serverBaseUrl = Env.get('SERVER_BASEURL')

      await wholesalerLicense.moveToDisk(subfolder)

      const path = await Drive.getUrl(`${subfolder}/${wholesalerLicense.fileName}`)

      const url = serverBaseUrl + path

      const fileUpload = await FileUpload.create({
        name: `${subfolder}/${wholesalerLicense.fileName}`,
        extname: wholesalerLicense.extname,
        type: wholesalerLicense.type,
        size: wholesalerLicense.size,
        path,
        url,
      })

      regulationAssessment.wholesalerLicenseId = fileUpload.id
    }

    const manufacturerLicense = request.file('manufacture_license')

    if (manufacturerLicense) {
      const subfolder = 'regulation-assessment/manufacture-license'

      const serverBaseUrl = Env.get('SERVER_BASEURL')

      await manufacturerLicense.moveToDisk(subfolder)

      const path = await Drive.getUrl(`${subfolder}/${manufacturerLicense.fileName}`)

      const url = serverBaseUrl + path

      const fileUpload = await FileUpload.create({
        name: `${subfolder}/${manufacturerLicense.fileName}`,
        extname: manufacturerLicense.extname,
        type: manufacturerLicense.type,
        size: manufacturerLicense.size,
        path,
        url,
      })

      regulationAssessment.manufacturerLicenseId = fileUpload.id
    }

    const testingReport = request.file('testing_report')

    if (testingReport) {
      const subfolder = 'regulation-assessment/testing-report'

      const serverBaseUrl = Env.get('SERVER_BASEURL')

      await testingReport.moveToDisk(subfolder)

      const path = await Drive.getUrl(`${subfolder}/${testingReport.fileName}`)

      const url = serverBaseUrl + path

      const fileUpload = await FileUpload.create({
        name: `${subfolder}/${testingReport.fileName}`,
        extname: testingReport.extname,
        type: testingReport.type,
        size: testingReport.size,
        path,
        url,
      })

      regulationAssessment.testingReportId = fileUpload.id
    }

    const userManual = request.file('user_manual')

    if (userManual) {
      const subfolder = 'regulation-assessment/user-manual'

      const serverBaseUrl = Env.get('SERVER_BASEURL')

      await userManual.moveToDisk(subfolder)

      const path = await Drive.getUrl(`${subfolder}/${userManual.fileName}`)

      const url = serverBaseUrl + path

      const fileUpload = await FileUpload.create({
        name: `${subfolder}/${userManual.fileName}`,
        extname: userManual.extname,
        type: userManual.type,
        size: userManual.size,
        path,
        url,
      })

      regulationAssessment.userManualId = fileUpload.id
    }

    const medicalLicense = request.file('medical_license')

    if (medicalLicense) {
      const subfolder = 'regulation-assessment/medical-license'

      const serverBaseUrl = Env.get('SERVER_BASEURL')

      await medicalLicense.moveToDisk(subfolder)

      const path = await Drive.getUrl(`${subfolder}/${medicalLicense.fileName}`)

      const url = serverBaseUrl + path

      const fileUpload = await FileUpload.create({
        name: `${subfolder}/${medicalLicense.fileName}`,
        extname: medicalLicense.extname,
        type: medicalLicense.type,
        size: medicalLicense.size,
        path,
        url,
      })

      regulationAssessment.medicalLicenseId = fileUpload.id
    }

    regulationAssessment.riskClassificationId = riskClassificationId
    regulationAssessment.productOwner = productOwnerName
    regulationAssessment.deviceLabel = nameAsDeviceLabel
    regulationAssessment.deviceIdentitier = deviceIdentitier
    regulationAssessment.intendedPurpose = intendedPurpose
    regulationAssessment.countryId = countryId
    regulationAssessment.specimenTypeId = specimenTypeId
    regulationAssessment.manufacturerId = manufacturer.id
    regulationAssessment.status = RegulationAssessmentStatusEnum.SUBMITTED

    await regulationAssessment.save()

    await regulationAssessment.related('regulatoryAgencies').attach(regulatoryAgencyIds)

    await regulationAssessment.related('daelerTypes').attach(daelerTypeIds)

    await regulationAssessment.load('manufacturer', (manufacturer) => {
      manufacturer.preload('user')
    })
    await regulationAssessment.load('riskClassification')
    await regulationAssessment.load('country')
    await regulationAssessment.load('regulatoryAgencies')
    await regulationAssessment.load('daelerTypes')
    await regulationAssessment.load('specimenType')

    await regulationAssessment.load('importerLicense')
    await regulationAssessment.load('wholesalerLicense')
    await regulationAssessment.load('manufacturerLicense')
    await regulationAssessment.load('testingReport')
    await regulationAssessment.load('userManual')
    await regulationAssessment.load('medicalLicense')

    return regulationAssessment
  }

  public async update({ request, params, bouncer }: HttpContextContract) {
    await bouncer.with('RegulationAssessmentPolicy').authorize('update')

    await request.validate(UpdateRegulationAssessmentValidator)

    const id = params.id

    const status: RegulationAssessmentStatusEnum = request.input('status')

    const regulationAssessment = await RegulationAssessment.find(id)

    if (!regulationAssessment) {
      throw new NotFoundException('Regulation Assessment not found')
    }

    regulationAssessment.status = status

    await regulationAssessment.save()

    await regulationAssessment.load('manufacturer', (manufacturer) => {
      manufacturer.preload('user')
    })
    await regulationAssessment.load('riskClassification')
    await regulationAssessment.load('country')
    await regulationAssessment.load('regulatoryAgencies')
    await regulationAssessment.load('daelerTypes')
    await regulationAssessment.load('specimenType')

    await regulationAssessment.load('importerLicense')
    await regulationAssessment.load('wholesalerLicense')
    await regulationAssessment.load('manufacturerLicense')
    await regulationAssessment.load('testingReport')
    await regulationAssessment.load('userManual')
    await regulationAssessment.load('medicalLicense')

    return regulationAssessment
  }

  public async show({ params }: HttpContextContract) {
    const id = params.id

    const regulationAssessment = await RegulationAssessment.find(id)

    if (!regulationAssessment) {
      throw new NotFoundException('Regulation Assessment not found')
    }

    await regulationAssessment.load('manufacturer', (manufacturer) => {
      manufacturer.preload('user')
    })
    await regulationAssessment.load('riskClassification')
    await regulationAssessment.load('country')
    await regulationAssessment.load('regulatoryAgencies')
    await regulationAssessment.load('daelerTypes')
    await regulationAssessment.load('specimenType')

    await regulationAssessment.load('importerLicense')
    await regulationAssessment.load('wholesalerLicense')
    await regulationAssessment.load('manufacturerLicense')
    await regulationAssessment.load('testingReport')
    await regulationAssessment.load('userManual')
    await regulationAssessment.load('medicalLicense')

    return regulationAssessment
  }
}
