import { PrismaClient } from '@prisma/client';

async function main() {
    const prisma = new PrismaClient();
    try {
        console.log("Checking database connection...");
        const userCount = await prisma.user.count();
        console.log(`Success! Total users: ${userCount}`);

        const users = await prisma.user.findMany({ take: 5 });
        console.log("Sample users:", users.map(u => u.username));

        console.log("Data extraction seems possible.");
    } catch (error) {
        console.error("Database connection failed or quota reached:");
        console.error(error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
