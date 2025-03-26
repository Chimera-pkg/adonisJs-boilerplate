import { action, BasePolicy } from '@ioc:Adonis/Addons/Bouncer'
import User, { UserRole } from 'App/Models/User'
import News from 'App/Models/News'

export default class NewsPolicy extends BasePolicy {
  @action({ allowGuest: true })
  public async view(user: User | undefined, news: News) {
    // admin can view all news
    if (user && user.isAdmin()) {
      return true
    }

    // all user except admin, only can view published news
    if (news.isPublished) {
      return true
    }

    return false
  }
  public async create(user: User) {
    return user.role === UserRole.admin
  }
  public async update(user: User) {
    return user.role === UserRole.admin
  }
  public async delete(user: User) {
    return user.role === UserRole.admin
  }
}
