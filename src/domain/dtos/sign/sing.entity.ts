import { db } from "../../../utils/db";
import { PaginationDto } from '../shared/pagination.dto';
import { CreateSingDto } from "./create-sign.dto";

export class SingEntity {
    async get(paginationDto :PaginationDto) {
        const {page, limit} = paginationDto;
        const offset = (page - 1) * limit;
        
        const data = await db.cmp_firmas_manuscritas.findMany({
            skip: offset,
            take: limit,
            where: {
                active: true
            },
            include: {
                persona: {
                    select: {
                        primer_apellido: true,
                        segundo_apellido: true,
                        nombres: true
                    }
                }
            }
        });

        return data;
    }

    async create(id_persona: number, img: string) {
        const data = await db.cmp_firmas_manuscritas.create({
            data: {
                id_persona,
                firma: img,
                active: true
            }
        });
        return data;
    } 

    async findOne(id: number) {
        const data = await db.cmp_firmas_manuscritas.findUnique({
            where: {
                id,
                active: true
            }
        });

        if(!data) return null

        return data;
    }

    async getHistoryByUserId(id: number) {
        const data = await db.cmp_firmas_manuscritas.findMany({
            where: {
                id_persona: id,
            }
        });

        return data;
    }

    async delete(id: number) {
        const data = await db.cmp_firmas_manuscritas.update({
            where: {
                id
            }, 
            data: {
                active: false
            }
        });

        return data;
    }

    async getLastByUserId(id: number) {
        const data = await db.cmp_firmas_manuscritas.findFirst({
            where: {
                id_persona: id,
                active: true
            },
            orderBy: {
                id: 'desc'
            }
        });

        return data ?? null;
    }
}