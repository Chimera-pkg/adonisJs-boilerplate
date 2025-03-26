import { schema, rules } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

const youtubeRegex = /^(http(s)?:\/\/)?((w){3}.)?youtu(be|.be)?(\.com)?\/.+/

export default class UpdateServiceValidator {
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
    description: schema.string.optional(),
    is_published: schema.boolean.optional(),
    category_id: schema.number.optional(),
    // thumbnail: schema.file({
    //   size: '1mb',
    //   extnames: ['jpg', 'jpeg', 'png', 'webp'],
    // }),
    specifications: schema.array.optional().members(
      schema.object().members({
        name: schema.string(),
        value: schema.string(),
      })
    ),
    clinical_applications: schema.array.optional().members(
      schema.object().members({
        content: schema.string(),
      })
    ),
    workflows: schema.array.optional().members(
      schema.object().members({
        seq: schema.number(),
        title: schema.string(),
        description: schema.string(),
      })
    ),
    comparisons: schema.array.optional().members(
      schema.object().members({
        comp_product_id: schema.number(),
        specs: schema.array().members(
          schema.object().members({
            origin_spec_id: schema.number(),
            comp_spec_id: schema.number(),
          })
        ),
      })
    ),
    faqs: schema.array.optional().members(
      schema.object().members({
        question: schema.string(),
        answer: schema.string(),
      })
    ),
    videos: schema.array.optional().members(schema.string({}, [rules.regex(youtubeRegex)])),
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
    'videos.url.regex': '"url" must be valid YouTube video URL',
  }
}
