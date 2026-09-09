import mongoose from 'mongoose';
import { AdminModel, IAdmin } from '../../../models/admin.model';

export class AdminAuthRepository {
  /**
   * Find admin by email (excluding passwordHash)
   */
  public async findByEmail(email: string): Promise<IAdmin | null> {
    return AdminModel.findOne({
      email: email.toLowerCase().trim(),
      isDeleted: false
    })
      .lean()
      .exec() as unknown as IAdmin | null;
  }

  /**
   * Find admin by email WITH passwordHash included for authentication verification
   */
  public async findForAuth(email: string): Promise<IAdmin | null> {
    return AdminModel.findOne({
      email: email.toLowerCase().trim(),
      isDeleted: false
    })
      .select('+passwordHash')
      .lean()
      .exec() as unknown as IAdmin | null;
  }

  /**
   * Find admin by ID
   */
  public async findById(id: string): Promise<IAdmin | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    return AdminModel.findOne({
      _id: new mongoose.Types.ObjectId(id),
      isDeleted: false
    })
      .lean()
      .exec() as unknown as IAdmin | null;
  }

  /**
   * Update login timestamp and IP address
   */
  public async updateLoginMetadata(id: string, ipAddress: string): Promise<void> {
    if (!mongoose.Types.ObjectId.isValid(id)) return;
    await AdminModel.findByIdAndUpdate(id, {
      $set: {
        lastLogin: new Date(),
        lastLoginIp: ipAddress || '',
        lastActive: new Date()
      }
    }).exec();
  }

  /**
   * Update admin document
   */
  public async update(id: string, data: Partial<IAdmin>): Promise<void> {
    if (!mongoose.Types.ObjectId.isValid(id)) return;
    await AdminModel.findByIdAndUpdate(id, { $set: data }).exec();
  }
}

export const adminAuthRepository = new AdminAuthRepository();
export default adminAuthRepository;
