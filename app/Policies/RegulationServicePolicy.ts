import { action, BasePolicy } from '@ioc:Adonis/Addons/Bouncer'
import User from 'App/Models/User'
import RegulationService from 'App/Models/RegulationService'

export default class RegulationServicePolicy extends BasePolicy {
  @action({ allowGuest: true })
  public async view(user: User | undefined, regulationService: RegulationService) {
    // admin always able to view the regulation service
    if (user && user.isAdmin()) {
      return true
    }

    // all user except admin, only can view published regulation service
    if (regulationService.isPublished) {
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
