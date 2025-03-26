import { BasePolicy } from '@ioc:Adonis/Addons/Bouncer'
import RegulationAssessment from 'App/Models/RegulationAssessment'
import User from 'App/Models/User'

export default class RegulationAssessmentPolicy extends BasePolicy {
  public viewList(user: User) {
    return user.isAdmin()
  }

  public async view(user: User | undefined, regulationAssessment: RegulationAssessment) {
    // manufacturer that owned the regulationAssessment always able to view the regulationAssessment
    if (user && user.isManufacturer() && user.id === regulationAssessment.manufacturer.userId) {
      return true
    }

    if (user?.isAdmin()) {
      return true
    }

    return false
  }

  public async create(user: User) {
    return user.isManufacturer()
  }

  public async update(user: User) {
    return user.isAdmin()
  }
  public async delete(user: User) {
    return user.isAdmin()
  }
}
