import { PrismaClient } from '@prisma/client';
import { auth } from '../src/lib/auth';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');
  
  const email = 'admin@cronjob.com';
  const password = 'password123';
  
  // Check if admin already exists
  const existingUser = await prisma.user.findFirst({
    where: { email },
  });

  if (!existingUser) {
    console.log(`Creating default admin user: ${email}`);
    
    // Use Better Auth's sign-up method to automatically handle password hashing
    // and create the associated Account records.
    try {
      const response = await auth.api.signUpEmail({
        body: {
          email,
          password,
          name: 'Super Admin',
        }
      });
      
      console.log('Admin user created successfully!', response);
    } catch (error) {
      console.error('Error creating admin user with Better Auth:', error);
    }
  } else {
    console.log('Admin user already exists. Skipping...');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
