import { BasePolicy } from '@ioc:Adonis/Addons/Bouncer'
import User, { UserRole } from 'App/Models/User'

export default class HealthcarePolicy extends BasePolicy {
  public async getProfile(user: User) {
    return user.role === UserRole.healthcare
  }
  public async updateProfile(user: User) {
    return user.role === UserRole.healthcare
  }
}
