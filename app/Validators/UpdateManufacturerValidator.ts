import { schema, rules } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

const youtubeRegex = /^(http(s)?:\/\/)?((w){3}.)?youtu(be|.be)?(\.com)?\/.+/
export default class UpdateManufacturerValidator {
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
    name: schema.string.optional(),
    pic_name: schema.string.optional(),
    description: schema.string.optional(),
    industry_category_id: schema.number.optional(),
    country_id: schema.number.optional(),
    address: schema.string.optional(),
    website: schema.string.optional(),
    video: schema.string.optional({}, [rules.regex(youtubeRegex)]),
    about: schema.string.optional(),
    category_id_one: schema.number.optional(),
    category_id_two: schema.number.optional(),
    current_password: schema.string.optional(),
    new_password: schema.string.optional({}, [rules.minLength(8)]),
    confirm_new_password: schema.string.optional({}, [rules.minLength(8)]),
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
  public messages = {
    'video.regex': '"video" must be valid YouTube video URL',
  }
}
