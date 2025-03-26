import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import LabTest from 'App/Models/LabTest'

export default class LabTestSeeder extends BaseSeeder {
  public async run() {
    await LabTest.createMany([
      {
        patientName: 'John Doe',
        testCaseId: 'TC001',
        physicianName: 'Dr. Alice Smith',
        disease: 'COVID-19',
        specimenType: 'Nasopharyngeal Swab',
        reportStatus: 'Completed',
      },
      {
        patientName: 'Jane Smith',
        testCaseId: 'TC002',
        physicianName: 'Dr. Robert Johnson',
        disease: 'Influenza A',
        specimenType: 'Throat Swab',
        reportStatus: 'Pending',
      },
      {
        patientName: 'Michael Brown',
        testCaseId: 'TC003',
        physicianName: 'Dr. Sarah Williams',
        disease: 'Strep Throat',
        specimenType: 'Throat Culture',
        reportStatus: 'In Progress',
      },
    ])
  }
}