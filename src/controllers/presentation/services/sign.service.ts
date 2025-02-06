import { cmp_firmas_manuscritas } from "@prisma/client";
import { CypherAdater } from "../../../config/cypher.adapter";
import { PaginationDto } from "../../../domain/dtos/shared/pagination.dto";
import { CreateSingDto } from "../../../domain/dtos/sign/create-sign.dto";
import { SingEntity } from "../../../domain/dtos/sign/sing.entity";
import sharp from "sharp";

export class SignService {
    constructor(
        private readonly singDatasource = new SingEntity(),
        private readonly cipher = new CypherAdater(process.env.SECRET_KEY)
    ) {};

    async decodedSings(data : cmp_firmas_manuscritas[]) {
        return await Promise.all(data.map(async (sing) => {
            let decodedBuff = await this.cipher.decrypt(sing['firma']);
            return {
                ...sing,
                firma: `data:image/png;base64,${decodedBuff.toString('base64')}`
            }
        }));
    }

    async get(pagination: PaginationDto) {
        const queryData = await this.singDatasource.get(pagination);
        return await this.decodedSings(queryData as any);
    }

    async create(createSingDto: CreateSingDto) {
        let encodedBuff = await this.cipher.encrypt(createSingDto['fileBuffer'] as any);
        return await this.singDatasource.create(createSingDto['id_persona'], encodedBuff);
    }

    async findOne(id: number) {
        const data = await this.singDatasource.findOne(id);
        if(!data) return null;
        let decodedBuff = await this.cipher.decrypt(data['firma']);
        return {
            ...data,
            firma: `data:image/png;base64,${decodedBuff.toString('base64')}`
        }
    }

    async delete(id: number) {
        const item = await this.singDatasource.findOne(id);
        if(!item) return null;

        return await this.singDatasource.delete(id);
    }

    async getHistoryByUserId(id: number) {
        const data = await this.singDatasource.getHistoryByUserId(id);
        return await this.decodedSings(data);
    }

    async getLastSingByUserId(id: number) {
        const firm = await this.singDatasource.getLastByUserId(id);
        if(!firm) return null;
        return await this.decodedSings([firm]);
    }
}