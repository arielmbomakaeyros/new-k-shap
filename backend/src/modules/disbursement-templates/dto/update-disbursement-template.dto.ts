import { PartialType } from '@nestjs/swagger';
import { CreateDisbursementTemplateDto } from './create-disbursement-template.dto';

export class UpdateDisbursementTemplateDto extends PartialType(CreateDisbursementTemplateDto) {}
