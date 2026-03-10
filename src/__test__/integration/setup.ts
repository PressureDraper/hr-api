import dotenv from 'dotenv';

const setup = async () => {
    dotenv.config({ path: '.env.test' });
}

export default setup;