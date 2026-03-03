import { Response, Request } from 'express';
import { SignService } from './presentation/services/sign.service';
import { PaginationDto } from '../domain/dtos/shared/pagination.dto';
import { CreateSingDto } from '../domain/dtos/sign/create-sign.dto';
import { cambiarFirmaAzulANegro } from '../helpers/changeSignColor';
export class SingController {

    constructor(
        private readonly signService: SignService,
    ) { };


    getSign = async (req: Request, res: Response) => {
        try {
            const { page = 1, limit = 1, name = '' } = req.query;
            const [error, paginationDto] = PaginationDto.create(+page, +limit);

            if (error) return res.status(400).json({ error });

            const sign = await this.signService.get(paginationDto!, name as string);
            const total = await this.signService.count(name as string);

            return res.status(200).json([{
                msg: 'OK',
                data: sign,
                count: total
            }]);
        } catch (error) {
            console.log(error)
            res.status(500).send('Internal server error');
        }
    }

    createSing = async (req: Request, res: Response) => {
        try {
            const { id_persona, file = [] } = req.body;
            const [error, createSingDto] = CreateSingDto.create(file, id_persona);
            // console.log(createSingDto!['fileBuffer'].toString())

            if (error) return res.status(400).json({ error });

            const created = this.signService.create(createSingDto!);

            return res.status(200).json({ data: created, ok: true });

        } catch (error) {
            console.log(error);
            res.status(500).send('Internal server error');
        }
    }

    updateSign = async (req: Request, res: Response) => {
        try {
            const { id_persona, file = [] } = req.body;
            const [error, createSingDto] = CreateSingDto.create(file, id_persona);

            if (error) return res.status(400).json({ error });

            const updated = this.signService.update(createSingDto!);

            return res.status(200).json({ data: updated, ok: true });

        } catch (error) {
            console.log(error);
            res.status(500).send('Internal server error');
        }
    }

    getOne = async (req: Request, res: Response) => {
        try {
            const id = req.params.id;
            if (!id) return res.status(400).json({ error: 'Id is required' });
            const sign = await this.signService.findOne(+id);
            if (!sign) return res.status(404).json({ error: 'Sign not found' });

            //hotfix para cambiar el color de la firma a negro, ya que se capturaron en azul y al imprimir sale con puntos blancos
            const newFirma = await cambiarFirmaAzulANegro(sign.firma);
            
            sign.firma = newFirma;
            
            return res.status(200).json(sign);
        } catch (err) {
            console.log(err);
            res.status(500).send('Internal server error');
        }
    }

    deleteSign = async (req: Request, res: Response) => {
        try {
            const id = req.params.id;
            if (!id) return res.status(400).json({ error: 'Id is required' });
            const itemDeleted = await this.signService.delete(+id);
            if (!itemDeleted) return res.status(404).json({ error: 'Sign not found' });
            return res.status(200).json({ ok: true });

        } catch (error) {
            console.log(error);
            res.status(500).send('Internal server error');
        }
    }

    getHistory = async (req: Request, res: Response) => {
        try {
            const id = req.params.id;
            if (!id) return res.status(400).json({ error: 'Id is required' });
            if (isNaN(+id)) return res.status(400).json({ error: 'Id must be a number' });
            const history = await this.signService.getHistoryByUserId(+id);
            return res.status(200).json(history);
        } catch (err) {
            console.log(err);
            res.status(500).send('Internal server error');
        }
    }

    private static handleError() {

    }
}