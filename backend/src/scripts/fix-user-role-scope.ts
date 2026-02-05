import 'reflect-metadata';
import { connect, disconnect, model, Types } from 'mongoose';
import { User, UserSchema } from '../database/schemas/user.schema';
import { Role, RoleSchema } from '../database/schemas/role.schema';

const dryRun = process.argv.includes('--dryRun');

const UserModel = model(User.name, UserSchema);
const RoleModel = model(Role.name, RoleSchema);

const run = async () => {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is required');
  }

  await connect(process.env.MONGODB_URI);

  const users = await UserModel.find({
    isDeleted: false,
    roles: { $exists: true, $ne: [] },
  }).lean();

  let updatedCount = 0;

  for (const user of users) {
    if (!user.company) continue;

    const roleIds = (user.roles || []).map((id: any) => new Types.ObjectId(id));
    if (!roleIds.length) continue;

    const roles = await RoleModel.find({ _id: { $in: roleIds } } as any).lean();
    const validRoles = roles
      .filter((role) => role.company?.toString() === user.company.toString())
      .map((role) => role._id.toString());

    let nextRoles = validRoles;

    if (nextRoles.length === 0 && user.systemRoles?.length) {
      const fallbackRole = await RoleModel.findOne({
        company: new Types.ObjectId(String(user.company)),
        systemRoleType: user.systemRoles[0],
      } as any).lean();
      if (fallbackRole) {
        nextRoles = [fallbackRole._id.toString()];
      }
    }

    const currentRoles = (user.roles || []).map((id: any) => id.toString());
    const changed =
      currentRoles.length !== nextRoles.length ||
      currentRoles.some((id: string) => !nextRoles.includes(id));

    if (changed) {
      // eslint-disable-next-line no-console
      console.log(`User ${user.email}: ${currentRoles.join(',')} -> ${nextRoles.join(',')}`);
      if (!dryRun) {
        await UserModel.updateOne(
          { _id: user._id },
          { $set: { roles: nextRoles.map((id) => new Types.ObjectId(id)) } },
        );
      }
      updatedCount += 1;
    }
  }

  // eslint-disable-next-line no-console
  console.log(`Updated ${updatedCount} users.`);

  await disconnect();
};

run().catch((error) => {
  // eslint-disable-next-line no-console
  console.error(error);
  process.exit(1);
});
