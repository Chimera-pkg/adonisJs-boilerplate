import { action, BasePolicy } from '@ioc:Adonis/Addons/Bouncer'
import User, { UserRole } from 'App/Models/User'
import Product from 'App/Models/Product'

export default class ProductClinicalApplicationPolicy extends BasePolicy {
  @action({ allowGuest: true })
  public async viewList(user: User | undefined, product: Product) {
    // manufacturer that owned the product always able to view the product
    if (user && user.role === UserRole.manufacturer && user.id === product.manufacturer.userId) {
      return true
    }

    // all user except owner, only can view published product
    if (product.isPublished) {
      return true
    }

    return false
  }

  public async create(user: User, product: Product) {
    if (user.role === UserRole.manufacturer && user.id === product.manufacturer.userId) {
      return true
    }
    return false
  }

  public async update(user: User, product: Product) {
    if (user.role === UserRole.manufacturer && user.id === product.manufacturer.userId) {
      return true
    }
    return false
  }

  public async delete(user: User, product: Product) {
    if (user.role === UserRole.manufacturer && user.id === product.manufacturer.userId) {
      return true
    }
    return false
  }
}
