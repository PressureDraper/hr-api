import moment from "moment";
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
                        nombres: true,
                        rch_empleados:{
                            select: {
                                id: true,
                                matricula: true,
                                cat_puestos: {
                                    select: { nombre: true }
                                }
                            }
                        }
                    },
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
                active: true,
                created_at: moment.utc().subtract(6, 'hour').toISOString(),
                updated_at: moment.utc().subtract(6, 'hour').toISOString()
            }
        });
        return data;
    }

    async findOne(id: number) {
        const data = await db.cmp_firmas_manuscritas.findFirst({
            where: {
                id_persona: id,
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
                active: true
            }
        });

        return data;
    }

    async delete(id: number) {
        const data = await db.cmp_firmas_manuscritas.updateMany({
            where: {
                id_persona: id
            }, 
            data: {
                active: false,
                deleted_at: moment.utc().subtract(6, 'hour').toISOString()
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