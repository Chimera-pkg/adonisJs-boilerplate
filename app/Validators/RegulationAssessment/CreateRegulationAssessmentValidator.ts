import { schema } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class CreateRegulationAssessmentValidator {
  constructor(protected ctx: HttpContextContract) {}

  /*
   * Define schema to validate the "shape", "type", "formatting" and "integrity" of data.
   *
   * For example:
   * 1. The username must be of data type string. But then also, it should
   *    not contain special characters or numbers.
   *    ```
   *     schema.string({}, [ rules.alpha() ])
   *    ```
   *
   * 2. The email must be of data type string, formatted as a valid
   *    email. But also, not used by any other user.
   *    ```
   *     schema.string({}, [
   *       rules.email(),
   *       rules.unique({ table: 'users', column: 'email' }),
   *     ])
   *    ```
   */
  public schema = schema.create({
    risk_classification_id: schema.number(),
    regulatory_agency_ids: schema.array().members(schema.number()),
    product_owner_name: schema.string(),
    name_as_device_label: schema.string(),
    device_identitier: schema.string(),
    intended_purpose: schema.string(),
    country_id: schema.number(),
    daeler_type_ids: schema.array().members(schema.number()),
    specimen_type_id: schema.number(),
    importer_license: schema.file({
      size: '3mb',
      extnames: ['pdf'],
    }),
    wholesaler_license: schema.file({
      size: '3mb',
      extnames: ['pdf'],
    }),
    manufacture_license: schema.file({
      size: '3mb',
      extnames: ['pdf'],
    }),
    testing_report: schema.file({
      size: '3mb',
      extnames: ['pdf'],
    }),
    user_manual: schema.file({
      size: '3mb',
      extnames: ['pdf'],
    }),
    medical_license: schema.file({
      size: '3mb',
      extnames: ['pdf'],
    }),
  })

  /**
   * Custom messages for validation failures. You can make use of dot notation `(.)`
   * for targeting nested fields and array expressions `(*)` for targeting all
   * children of an array. For example:
   *
   * {
   *   'profile.username.required': 'Username is required',
   *   'scores.*.number': 'Define scores as valid numbers'
   * }
   *
   */
  public messages = {}
}
