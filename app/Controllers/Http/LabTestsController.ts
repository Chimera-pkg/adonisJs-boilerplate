import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import LabTest from 'App/Models/LabTest';

export default class LabTestsController {
  public async index({ response }: HttpContextContract) {
    const labTests = await LabTest.all();
    return response.ok(labTests);
  }

  public async store({ request, response }: HttpContextContract) {
    const data = request.only([
      'patientName',
      'testCaseId',
      'physicianName',
      'disease',
      'specimenType',
      'reportStatus',
    ]);
    const labTest = await LabTest.create(data);
    return response.created(labTest);
  }

  public async show({ params, response }: HttpContextContract) {
    const labTest = await LabTest.findOrFail(params.id);
    return response.ok(labTest);
  }

  public async update({ params, request, response }: HttpContextContract) {
    const labTest = await LabTest.findOrFail(params.id);
    const data = request.only([
      'patientName',
      'testCaseId',
      'physicianName',
      'disease',
      'specimenType',
      'reportStatus',
    ]);
    labTest.merge(data);
    await labTest.save();
    return response.ok(labTest);
  }

  public async destroy({ params, response }: HttpContextContract) {
    const labTest = await LabTest.findOrFail(params.id);
    await labTest.delete();
    return response.noContent();
  }
}