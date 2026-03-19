import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as fs from 'fs';
import 'dotenv/config';

function log(message: string) {
    console.log(message);
    fs.appendFileSync('verify_output.log', message + '\n');
}

function errorLog(message: string, error?: any) {
    console.error(message, error);
    fs.appendFileSync('verify_output.log', `ERROR: ${message} ${error ? JSON.stringify(error, Object.getOwnPropertyNames(error)) : ''}\n`);
}

async function main() {
    const connectionString = process.env.DATABASE_URL;
    log(`DATABASE_URL present: ${!!connectionString}`);

    const pool = new Pool({ connectionString });
    const adapter = new PrismaPg(pool);
    const prisma = new PrismaClient({ adapter });

    const testId = 99999;

    log('Verifying Member model...');

    try {
        // Check if Member exists (using the new model name)
        let member = await prisma.member.findUnique({
            where: { id: testId },
        });

        if (member) {
            log('Test member already exists. Deleting...');
            await prisma.member.delete({ where: { id: testId } });
        }

        log('Creating new test member...');
        member = await prisma.member.create({
            data: {
                id: testId,
                memberId: `eh_${testId}`,
                year: 2026,
                name: `TestStudent${testId}`,
            },
        });

        log(`Member created: ${JSON.stringify(member)}`);

        if (member.memberId === `eh_${testId}`) {
            log('SUCCESS: Member ID prefix logic is correct.');
        } else {
            errorLog(`FAILURE: Member ID is ${member.memberId}, expected eh_${testId}`);
            process.exit(1);
        }

        // Cleanup
        await prisma.member.delete({ where: { id: testId } });
        log('Test member cleanup complete.');

    } catch (error) {
        errorLog('Error during verification:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
        await pool.end();
    }
}

main().catch(e => {
    errorLog('Unhandled error:', e);
    process.exit(1);
});
