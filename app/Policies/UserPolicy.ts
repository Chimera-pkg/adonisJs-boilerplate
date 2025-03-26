import { BasePolicy } from '@ioc:Adonis/Addons/Bouncer'
import User from 'App/Models/User'

export default class UserPolicy extends BasePolicy {
  public async viewList(user: User) {
    return user.isAdmin()
  }
  public async view(user: User) {
    return user.isAdmin()
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
