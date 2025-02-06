export class PaginationDto {
    constructor(
        public readonly page: number,
        public readonly limit: number,
    ) {};

    static create(page: number = 1, limit: number = 1) : [string?, PaginationDto?] {
        if(isNaN(page) || isNaN(limit)) return ['Invalid page or limit'];
        if(page <= 0) return ['Page muydst be greater than 0'];
        if(limit <= 0) return ['Limit must be greater than 0'];

        return [undefined, new PaginationDto(page, limit)];
    }

}