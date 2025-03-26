import { action, BasePolicy } from '@ioc:Adonis/Addons/Bouncer'
import User from 'App/Models/User'
import MarketingService from 'App/Models/MarketingService'

export default class MarketingServicePolicy extends BasePolicy {
  @action({ allowGuest: true })
  public async view(user: User | undefined, marketingService: MarketingService) {
    // admin always able to view the marketing service
    if (user && user.isAdmin()) {
      return true
    }

    // all user except admin, only can view published marketing service
    if (marketingService.isPublished) {
      return true
    }

    return false
  }

  public async create(user: User) {
    return user.isAdmin()
  }
  public async update(user: User) {
    return user.isAdmin()
  }
  public async delete(user: User) {
    return user.isAdmin()
  }
}
