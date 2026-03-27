import { db } from '../../utils/db';

const globalTeardown = async () => {
    console.log('🧹 [integration] Limpiando configuraciones...');

    await db.$disconnect();
}

export default globalTeardown;