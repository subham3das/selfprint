import { AdminModel } from '../../models/admin.model';
import { passwordUtils } from '../../utils/password';

export interface SeedSuperAdminOptions {
  name?: string;
  displayName?: string;
  email?: string;
  password?: string;
}

export const seedSuperAdmin = async (options?: SeedSuperAdminOptions): Promise<boolean> => {
  const name = options?.name || process.env.SUPER_ADMIN_NAME || 'Subham';
  const displayName = options?.displayName || process.env.SUPER_ADMIN_DISPLAY_NAME || 'Super Admin';
  const email = (options?.email || process.env.SUPER_ADMIN_EMAIL || 'das01subhamj@gmail.com')
    .toLowerCase()
    .trim();
  const rawPassword = options?.password || process.env.SUPER_ADMIN_PASSWORD || 'Subham@Admin2026!';

  try {
    // 1. Check if Super Admin account already exists
    const existingSuperAdmin = await AdminModel.findOne({
      $or: [{ email }, { role: 'SUPER_ADMIN' }]
    });

    if (existingSuperAdmin) {
      console.log(`[Seed] Super Admin account already exists (${existingSuperAdmin.email}). Skipping creation.`);
      return false;
    }

    // 2. Hash password securely with bcrypt
    const passwordHash = await passwordUtils.hash(rawPassword);

    // 3. Create permanent Super Admin record in dedicated `admins` collection
    const superAdmin = await AdminModel.create({
      name,
      displayName,
      email,
      passwordHash,
      role: 'SUPER_ADMIN',
      status: 'ACTIVE',
      permissions: ['FULL_ACCESS', '*'],
      avatar: '',
      isDeleted: false
    });

    console.log(`[Seed] Initial Super Admin created successfully:`);
    console.log(`  - ID: ${superAdmin._id}`);
    console.log(`  - Name: ${superAdmin.name} (${superAdmin.displayName})`);
    console.log(`  - Email: ${superAdmin.email}`);
    console.log(`  - Role: ${superAdmin.role}`);
    console.log(`  - Status: ${superAdmin.status}`);
    console.log(`  - Permissions: ${superAdmin.permissions.join(', ')}`);

    return true;
  } catch (error) {
    console.error('[Seed] Error creating Super Admin:', error);
    throw error;
  }
};

export default seedSuperAdmin;
