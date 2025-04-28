import { Controller } from '@nestjs/common';
import { CONFIG } from '../config/config.schema';

@Controller(CONFIG.HEADER_API)
export class BookingsController {}
