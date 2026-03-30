import dotenv from 'dotenv';

const globalSetup = async () => {
    console.log('\n🚀 Inicializando configuraciones globales...');

    const { db } = await import('../utils/db');
    await db.$connect();
}

export default globalSetup;