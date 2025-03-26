import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import NotFoundException from 'App/Exceptions/NotFoundException'
import Drive from '@ioc:Adonis/Core/Drive'
import Env from '@ioc:Adonis/Core/Env'
import FileUpload from 'App/Models/FileUpload'
import News from 'App/Models/News'
import UnprocessableEntityException from 'App/Exceptions/UnprocessableEntityException'
import CreateNewsValidator from 'App/Validators/News/CreateNewsValidator'
import UpdateNewsValidator from 'App/Validators/News/UpdateNewValidator'

export default class NewsController {
  public async index({ auth, request }: HttpContextContract) {
    const page = request.input('page', 1)
    const limit = request.input('limit', 10)

    let user = auth.user

    const newss = await News.query()
      .withScopes((scopes) => scopes.visibleTo(user))
      .preload('image')
      .paginate(page, limit)

    newss.baseUrl('/news')

    return newss
  }

  public async show({ params, bouncer }: HttpContextContract) {
    const idOrSlug = params.id
    const news = await News.query().where('id', idOrSlug).orWhere('slug', idOrSlug).first()

    if (!news) {
      throw new NotFoundException('news is not found')
    }

    await bouncer.with('NewsPolicy').authorize('view', news)

    await news.load('image')

    return news
  }

  public async store({ request, bouncer }) {
    await request.validate(CreateNewsValidator)

    await bouncer.with('NewsPolicy').authorize('create')

    const title = request.input('title')
    const content = request.input('content')
    const image = request.file('image')
    let isPublished = request.input('is_published', false)

    if (typeof isPublished === 'string') {
      isPublished = isPublished === 'true'
    }

    const news = new News()

    if (image) {
      const subfolder = 'news-image'

      const serverBaseUrl = Env.get('SERVER_BASEURL')

      await image.moveToDisk(subfolder)

      const path = await Drive.getUrl(`${subfolder}/${image.fileName}`)

      const url = serverBaseUrl + path

      const fileUpload = await FileUpload.create({
        name: `${subfolder}/${image.fileName}`,
        extname: image.extname,
        type: image.type,
        size: image.size,
        path,
        url,
      })

      news.imageId = fileUpload.id
    }

    news.title = title
    news.content = content
    news.isPublished = isPublished

    await news.save()

    await news.load('image')

    return news
  }

  public async update({ params, request, bouncer }) {
    await request.validate(UpdateNewsValidator)

    const news = await News.find(params.id)

    if (!news) {
      throw new NotFoundException('news is not found')
    }

    await bouncer.with('NewsPolicy').authorize('update')

    const title = request.input('title')
    const content = request.input('content')
    const image = request.file('image', {
      size: '1mb',
      extnames: ['jpg', 'jpeg', 'png', 'webp'],
    })

    let isPublished = request.input('is_published')

    if (typeof isPublished === 'string') {
      isPublished = isPublished === 'true'
    }

    if (image) {
      if (image.errors.length) {
        throw new UnprocessableEntityException('image validation failed', image.errors)
      }
      const subfolder = 'news-image'
      await image.moveToDisk(subfolder)

      const serverBaseUrl = Env.get('SERVER_BASEURL')
      const path = await Drive.getUrl(`${subfolder}/${image.fileName}`)

      const url = serverBaseUrl + path

      const fileUpload = await FileUpload.find(news.imageId)

      if (!fileUpload) {
        const fileUpload = await FileUpload.create({
          name: `${subfolder}/${image.fileName}`,
          extname: image.extname,
          type: image.type,
          size: image.size,
          path,
          url,
        })

        news.imageId = fileUpload.id
      } else {
        await Drive.delete(fileUpload.name)

        fileUpload.name = `${subfolder}/${image.fileName}`
        fileUpload.extname = image.extname
        fileUpload.type = image.type
        fileUpload.size = image.size
        fileUpload.path = path
        fileUpload.url = url

        await fileUpload.save()
      }
    }

    news.title = title
    news.content = content
    news.isPublished = isPublished

    await news.save()

    await news.load('image')

    return news
  }

  public async destroy({ params, bouncer }: HttpContextContract) {
    const news = await News.find(params.id)

    if (!news) {
      throw new NotFoundException('news is not found')
    }

    await bouncer.with('NewsPolicy').authorize('delete')

    await news.delete()

    const fileUpload = await FileUpload.find(news.imageId)

    if (fileUpload) {
      await Drive.delete(fileUpload.name)
      await fileUpload.delete()
    }

    return {
      message: `SUCCESS: news deleted`,
      code: 'SUCCESS',
    }
  }
}
