import { BasePolicy } from '@ioc:Adonis/Addons/Bouncer'
import User, { UserRole } from 'App/Models/User'

export default class ManufacturerPolicy extends BasePolicy {
  public async getProfile(user: User) {
    return user.role === UserRole.manufacturer
  }
  public async updateProfile(user: User) {
    return user.role === UserRole.manufacturer
  }
}
