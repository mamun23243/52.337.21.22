import { PrismaClient, RoleName } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL || "admin@example.com";
  const password = process.env.ADMIN_PASSWORD;

  if (!password) {
    throw new Error("ADMIN_PASSWORD must be set before seeding.");
  }

  const permissions = [
    ["dashboard.view","Dashboard"],
    ["users.manage","Manage users"],
    ["staff.manage","Manage staff"],
    ["departments.manage","Manage departments"],
    ["records.manage","Manage records"],
    ["reports.view","View reports"],
    ["notifications.manage","Manage notifications"],
    ["activity.view","View activity logs"],
    ["profile.manage","Manage profile"],
    ["settings.manage","Manage settings"]
  ];

  for (const [key,label] of permissions) {
    await prisma.permission.upsert({ where:{key}, update:{label}, create:{key,label} });
  }

  for (const name of Object.values(RoleName)) {
    await prisma.role.upsert({ where:{name}, update:{}, create:{name} });
  }

  const adminRole = await prisma.role.findUniqueOrThrow({ where:{name:"SUPER_ADMIN"} });
  const allPermissions = await prisma.permission.findMany();
  for (const p of allPermissions) {
    await prisma.rolePermission.upsert({
      where:{roleId_permissionId:{roleId:adminRole.id,permissionId:p.id}},
      update:{},
      create:{roleId:adminRole.id,permissionId:p.id}
    });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.user.upsert({
    where:{email},
    update:{role:"SUPER_ADMIN",status:"ACTIVE"},
    create:{
      email,
      username: process.env.ADMIN_USERNAME || "admin",
      name: process.env.ADMIN_NAME || "System Administrator",
      passwordHash,
      role:"SUPER_ADMIN",
      status:"ACTIVE",
      forcePasswordChange:false
    }
  });

  console.log(`Admin ready: ${email}`);
}

main().finally(()=>prisma.$disconnect());
