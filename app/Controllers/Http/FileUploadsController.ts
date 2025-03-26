import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Drive from '@ioc:Adonis/Core/Drive'
import Env from '@ioc:Adonis/Core/Env'
import CreateFileUploadValidator from 'App/Validators/CreateFileUploadValidator'
import FileUpload from 'App/Models/FileUpload'
import NotFoundException from 'App/Exceptions/NotFoundException'

export default class FileUploadsController {
  public async index({ request }: HttpContextContract) {
    const page = request.input('page', 1)
    const limit = request.input('limit', 10)

    const fileUploads = await FileUpload.query().paginate(page, limit)

    fileUploads.baseUrl(`/file-uploads`)

    return fileUploads
  }

  public async store({ request }) {
    await request.validate(CreateFileUploadValidator)

    const file = request.file('file')

    const subfolder = 'file-upload'
    await file.moveToDisk(subfolder)

    const serverBaseUrl = Env.get('SERVER_BASEURL')
    const path = await Drive.getUrl(`${subfolder}/${file.fileName}`)

    const url = serverBaseUrl + path

    const fileUpload = await FileUpload.create({
      name: `${subfolder}/${file.fileName}`,
      extname: file.extname,
      type: file.type,
      size: file.size,
      path,
      url,
    })

    return fileUpload
  }

  public async show({ request }: HttpContextContract) {
    const id = request.param('id')

    const fileUpload = await FileUpload.find(id)

    if (!fileUpload) {
      throw new NotFoundException('File upload is not found')
    }

    fileUpload.serialize({
      fields: {
        omit: ['name', 'size', 'path'],
      },
    })

    return fileUpload
  }
}
