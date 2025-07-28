import { Jimp, JimpInstance } from "jimp";

export const cambiarFirmaAzulANegro = async (base64Image: string): Promise<string> => {
    const buffer = Buffer.from(base64Image.replace(/^data:image\/\w+;base64,/, ''), 'base64');
    const image = await Jimp.read(buffer);

    // Recorremos cada píxel y cambiamos colores
    image.scan(0, 0, image.bitmap.width, image.bitmap.height, function (this: JimpInstance, x, y, idx) {
        const red = this.bitmap.data[idx + 0];
        const green = this.bitmap.data[idx + 1];
        const blue = this.bitmap.data[idx + 2];

        // Detectamos "azul" con cierta tolerancia
        const isBlue =
            blue > 100 &&             // azul alto
            red < 100 &&              // rojo bajo
            green < 100;              // verde bajo

        if (isBlue) {
            // Lo cambiamos a negro
            this.bitmap.data[idx + 0] = 0;   // R
            this.bitmap.data[idx + 1] = 0;   // G
            this.bitmap.data[idx + 2] = 0;   // B
        }
    });

    const firma = await image.getBase64('image/png', (err: any, base64: string) => {
        if (err) {
            return err;
        } else {
            return base64;
        }
    });
    return firma;
}