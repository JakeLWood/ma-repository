"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('Starting database seed...');
    // Clear existing data
    await prisma.activity.deleteMany();
    await prisma.checklistItem.deleteMany();
    await prisma.checklist.deleteMany();
    await prisma.document.deleteMany();
    await prisma.deal.deleteMany();
    await prisma.contact.deleteMany();
    await prisma.company.deleteMany();
    await prisma.user.deleteMany();
    // Create users
    const hashedPassword = await bcrypt_1.default.hash('Admin123!', 10);
    const adminUser = await prisma.user.create({
        data: {
            email: 'admin@ma-platform.com',
            password: hashedPassword,
            firstName: 'Admin',
            lastName: 'User',
            role: client_1.Role.ADMIN,
        },
    });
    const regularUser = await prisma.user.create({
        data: {
            email: 'user@ma-platform.com',
            password: await bcrypt_1.default.hash('User123!', 10),
            firstName: 'John',
            lastName: 'Doe',
            role: client_1.Role.USER,
        },
    });
    console.log('Created users');
    // Create companies
    const companies = await Promise.all([
        prisma.company.create({
            data: {
                name: 'TechCorp Inc.',
                industry: 'Technology',
                website: 'https://techcorp.example.com',
                description: 'Leading software solutions provider',
                address: '123 Tech Street',
                city: 'San Francisco',
                state: 'CA',
                country: 'USA',
                revenue: 5000000,
                employees: 50,
                tags: ['SaaS', 'B2B', 'Enterprise'],
            },
        }),
        prisma.company.create({
            data: {
                name: 'DataSoft Solutions',
                industry: 'Data Analytics',
                website: 'https://datasoft.example.com',
                description: 'Data analytics and business intelligence',
                address: '456 Data Ave',
                city: 'New York',
                state: 'NY',
                country: 'USA',
                revenue: 3000000,
                employees: 30,
                tags: ['Analytics', 'Big Data', 'AI'],
            },
        }),
        prisma.company.create({
            data: {
                name: 'CloudVentures LLC',
                industry: 'Cloud Computing',
                website: 'https://cloudventures.example.com',
                description: 'Cloud infrastructure and services',
                address: '789 Cloud Blvd',
                city: 'Seattle',
                state: 'WA',
                country: 'USA',
                revenue: 8000000,
                employees: 75,
                tags: ['Cloud', 'Infrastructure', 'DevOps'],
            },
        }),
    ]);
    console.log('Created companies');
    // Create contacts
    const contacts = await Promise.all([
        prisma.contact.create({
            data: {
                firstName: 'Alice',
                lastName: 'Johnson',
                email: 'alice.johnson@techcorp.example.com',
                phone: '+1-555-0101',
                title: 'CEO',
                linkedin: 'https://linkedin.com/in/alicejohnson',
                notes: 'Key decision maker',
                companyId: companies[0].id,
                userId: adminUser.id,
            },
        }),
        prisma.contact.create({
            data: {
                firstName: 'Bob',
                lastName: 'Smith',
                email: 'bob.smith@datasoft.example.com',
                phone: '+1-555-0102',
                title: 'CFO',
                linkedin: 'https://linkedin.com/in/bobsmith',
                notes: 'Financial expert',
                companyId: companies[1].id,
                userId: adminUser.id,
            },
        }),
        prisma.contact.create({
            data: {
                firstName: 'Carol',
                lastName: 'Williams',
                email: 'carol.williams@cloudventures.example.com',
                phone: '+1-555-0103',
                title: 'CTO',
                linkedin: 'https://linkedin.com/in/carolwilliams',
                notes: 'Technical lead',
                companyId: companies[2].id,
                userId: regularUser.id,
            },
        }),
    ]);
    console.log('Created contacts');
    // Create deals
    const deals = await Promise.all([
        prisma.deal.create({
            data: {
                name: 'TechCorp Acquisition',
                description: 'Strategic acquisition of TechCorp for market expansion',
                stage: client_1.DealStage.DUE_DILIGENCE,
                status: client_1.DealStatus.ACTIVE,
                dealType: client_1.DealType.ACQUISITION,
                companyId: companies[0].id,
                valuation: 10000000,
                dealAmount: 12000000,
                closeDate: new Date('2026-06-30'),
                probability: 75,
                userId: adminUser.id,
            },
        }),
        prisma.deal.create({
            data: {
                name: 'DataSoft Investment',
                description: 'Series B investment round',
                stage: client_1.DealStage.NEGOTIATION,
                status: client_1.DealStatus.ACTIVE,
                dealType: client_1.DealType.INVESTMENT,
                companyId: companies[1].id,
                valuation: 15000000,
                dealAmount: 5000000,
                closeDate: new Date('2026-05-15'),
                probability: 60,
                userId: adminUser.id,
            },
        }),
        prisma.deal.create({
            data: {
                name: 'CloudVentures Merger',
                description: 'Strategic merger to combine cloud capabilities',
                stage: client_1.DealStage.SCREENING,
                status: client_1.DealStatus.ACTIVE,
                dealType: client_1.DealType.MERGER,
                companyId: companies[2].id,
                valuation: 20000000,
                dealAmount: 20000000,
                closeDate: new Date('2026-09-30'),
                probability: 45,
                userId: regularUser.id,
            },
        }),
    ]);
    console.log('Created deals');
    // Create checklists
    const checklist1 = await prisma.checklist.create({
        data: {
            name: 'Financial Due Diligence',
            category: 'Financial',
            dealId: deals[0].id,
            items: {
                create: [
                    { title: 'Review financial statements (3 years)', description: 'Analyze P&L, balance sheet, cash flow' },
                    { title: 'Verify revenue recognition policies', completed: true },
                    { title: 'Assess outstanding liabilities', description: 'Review all debts and obligations' },
                    { title: 'Tax compliance review', completed: true },
                    { title: 'Working capital analysis' },
                ],
            },
        },
    });
    const checklist2 = await prisma.checklist.create({
        data: {
            name: 'Legal Due Diligence',
            category: 'Legal',
            dealId: deals[0].id,
            items: {
                create: [
                    { title: 'Review corporate structure', completed: true },
                    { title: 'Intellectual property audit' },
                    { title: 'Contract review (top 10 customers)', description: 'Review key customer contracts' },
                    { title: 'Employment agreements review' },
                    { title: 'Litigation and disputes check', completed: true },
                ],
            },
        },
    });
    console.log('Created checklists');
    // Create activities
    await Promise.all([
        prisma.activity.create({
            data: {
                type: client_1.ActivityType.CALL,
                description: 'Initial call with Alice Johnson to discuss acquisition terms',
                userId: adminUser.id,
                contactId: contacts[0].id,
                dealId: deals[0].id,
            },
        }),
        prisma.activity.create({
            data: {
                type: client_1.ActivityType.MEETING,
                description: 'In-person meeting with DataSoft management team',
                userId: adminUser.id,
                contactId: contacts[1].id,
                dealId: deals[1].id,
            },
        }),
        prisma.activity.create({
            data: {
                type: client_1.ActivityType.EMAIL,
                description: 'Sent NDA to CloudVentures for review',
                userId: regularUser.id,
                contactId: contacts[2].id,
                dealId: deals[2].id,
            },
        }),
        prisma.activity.create({
            data: {
                type: client_1.ActivityType.STAGE_CHANGE,
                description: 'Deal moved to Due Diligence stage',
                userId: adminUser.id,
                dealId: deals[0].id,
            },
        }),
    ]);
    console.log('Created activities');
    console.log('Database seed completed successfully!');
    console.log('\nDefault login credentials:');
    console.log('Email: admin@ma-platform.com');
    console.log('Password: Admin123!');
}
main()
    .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map