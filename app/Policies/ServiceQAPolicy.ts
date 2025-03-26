import { action, BasePolicy } from '@ioc:Adonis/Addons/Bouncer'
import Service from 'App/Models/Service'
import User from 'App/Models/User'

export default class ServiceQAPolicy extends BasePolicy {
  @action({ allowGuest: true })
  public async viewList(user: User | undefined, service: Service) {
    // manufacturer that owned the service always able to view the service
    if (user && user.isManufacturer() && user.id === service.manufacturer.userId) {
      return true
    }

    // all user except owner, only can view published service
    if (service.isPublished) {
      return true
    }

    return false
  }

  public async create(user: User, service: Service) {
    if (user.isManufacturer() && user.id === service.manufacturer.userId) {
      return true
    }
    return false
  }

  public async update(user: User, service: Service) {
    if (user.isManufacturer() && user.id === service.manufacturer.userId) {
      return true
    }
    return false
  }

  public async delete(user: User, service: Service) {
    if (user.isManufacturer() && user.id === service.manufacturer.userId) {
      return true
    }
    return false
  }
}
