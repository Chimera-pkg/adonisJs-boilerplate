import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import User, { UserRole } from 'App/Models/User'

export default class UserSeeder extends BaseSeeder {
  public async run() {
    const uniqueKey = 'id'

    await User.updateOrCreateMany(uniqueKey, [
      {
        id: 1,
        email: 'admin@mail.com',
        username: 'admin',
        password: 'admin',
        isVerified: true,
        role: UserRole.admin,
      },
      {
        id: 2,
        email: 'patient@mail.com',
        username: 'patient',
        password: 'patient',
        isVerified: true,
      },
      {
        id: 3,
        email: 'nurse@mail.com',
        username: 'nurse',
        password: 'nurses',
        isVerified: true,
      },
      {
        id: 4,
        email: 'pharmacist@mail.com',
        username: 'pharmacist',
        password: 'pharmacist',
        isVerified: true,
      },
    ])
  }
}
