import { BasePolicy } from '@ioc:Adonis/Addons/Bouncer'
import User from 'App/Models/User'

export default class IndustryCategoryPolicy extends BasePolicy {
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
