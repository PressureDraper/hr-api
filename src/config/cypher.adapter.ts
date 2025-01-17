import crypto from 'crypto';

export class CypherAdater {
    private readonly algorithm = 'aes-256-cbc';
    private readonly key: Buffer;

    constructor(
        private readonly secretKey: string = '123456$#@$^@LF236',
    ) {
        this.key = crypto.createHash('sha256').update(secretKey).digest();
    }

    async encrypt(buffer: Buffer): Promise<string> {
        const data = buffer.toString('base64'); // Convierte el buffer a base64
        const iv = crypto.randomBytes(16); // Genera un IV aleatorio
        const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);
        let encrypted = cipher.update(data, 'utf-8', 'base64');
        encrypted += cipher.final('base64');
        return `${iv.toString('base64')}:${encrypted}`; // Retorna IV y datos cifrados
    }

    async decrypt(encryptedData: string): Promise<Buffer> {
        const [ivBase64, encrypted] = encryptedData.split(':');
        if (!ivBase64 || !encrypted) {
            throw new Error('Invalid encrypted data format');
        }

        const iv = Buffer.from(ivBase64, 'base64'); // Convierte el IV desde base64
        const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv);
        let decrypted = decipher.update(encrypted, 'base64', 'utf-8');
        decrypted += decipher.final('utf-8');
        return Buffer.from(decrypted, 'base64'); // Convierte de base64 a buffer
    }
}
