export class CreateSingDto {
    constructor(
        private readonly id_persona: number,
        private readonly fileBuffer: string
    ) {};
    
    static create(file: any[], id_persona: number) : [string?, CreateSingDto?] {
        if(file.length === 0) return ['file is required'];
        if(!id_persona) return ['id_persona is required'];
        const fistFile = file.at(0);
        const image = fistFile.data.toString('base64');
        
        return [undefined, new CreateSingDto(+id_persona, image)];
    }
}