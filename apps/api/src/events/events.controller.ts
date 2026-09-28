import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { EventsService } from './events.service';
import {
  CreateOperationalEventDto,
  DepthEventsQueryDto,
  EventSeverity,
  EventType,
  NearDepthQueryDto,
  UserRole,
} from '@nwis/types';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@ApiTags('Events & Precedents')
@Controller('api/v1/events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get('near-depth')
  @ApiOperation({
    summary: 'Precedent Engine: Find historical events near a target depth interval (cross-well correlation)',
  })
  @ApiQuery({ name: 'targetDepth', required: true, type: Number })
  @ApiQuery({ name: 'toleranceMeters', required: false, type: Number })
  @ApiQuery({ name: 'formation', required: false, type: String })
  @ApiQuery({ name: 'eventType', required: false, enum: EventType })
  @ApiQuery({ name: 'excludeWellId', required: false, type: String })
  async getNearDepthEvents(@Query() query: NearDepthQueryDto) {
    return this.eventsService.findNearDepth(query);
  }

  @Get()
  @ApiOperation({ summary: 'Query historical drilling events filtered by formation, depth window, type, or severity' })
  @ApiQuery({ name: 'formation', required: false, type: String })
  @ApiQuery({ name: 'minDepth', required: false, type: Number })
  @ApiQuery({ name: 'maxDepth', required: false, type: Number })
  @ApiQuery({ name: 'eventType', required: false, enum: EventType })
  @ApiQuery({ name: 'severity', required: false, enum: EventSeverity })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  async getEvents(@Query() query: DepthEventsQueryDto) {
    return this.eventsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get operational event detail including root cause, mitigation, and provenance' })
  async getEventById(@Param('id') id: string) {
    return this.eventsService.findById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.DRILLING_ENGINEER, UserRole.GEOLOGIST)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Record a new operational drilling event' })
  async createEvent(@Body() body: CreateOperationalEventDto) {
    return this.eventsService.create(body);
  }
}
