"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = __importDefault(require("./config/prisma"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
async function test() {
    try {
        console.log('1. Connecting to DB...');
        const user = await prisma_1.default.user.findUnique({ where: { email: 'admin@opspilot.com' } });
        console.log('User found:', user ? user.email : 'NULL');
        if (!user) {
            console.log('2. User not found, seeding default admin user...');
            const passwordHash = await bcryptjs_1.default.hash('password123', 12);
            const newUser = await prisma_1.default.user.create({
                data: {
                    email: 'admin@opspilot.com',
                    name: 'Mithun',
                    passwordHash,
                    role: 'ADMIN',
                },
            });
            console.log('Created User:', newUser.email);
        }
    }
    catch (err) {
        console.error('❌ EXACT ERROR CAUSE:', err);
    }
    finally {
        await prisma_1.default.$disconnect();
    }
}
test();
//# sourceMappingURL=testLogin.js.map