import dotenv from 'dotenv';
import { db } from '../../utils/db';

const globalSetup = async () => {
    console.log('\n🚀  [integration] Inicializando configuraciones globales...');

    dotenv.config({ path: '.env.test' });
    
    await db.$connect();
}

export default globalSetup;