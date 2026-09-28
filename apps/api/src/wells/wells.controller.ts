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
import { WellsService } from './wells.service';
import { CreateWellDto, NearbyWellsQueryDto, WellStatus, WellType, UserRole } from '@nwis/types';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@ApiTags('Wells')
@Controller('api/v1/wells')
export class WellsController {
  constructor(private readonly wellsService: WellsService) {}

  @Get('nearby')
  @ApiOperation({ summary: 'Geospatial radius search for nearby wells using PostGIS / earthdistance' })
  @ApiQuery({ name: 'latitude', required: true, type: Number })
  @ApiQuery({ name: 'longitude', required: true, type: Number })
  @ApiQuery({ name: 'radiusKm', required: true, type: Number })
  @ApiQuery({ name: 'formation', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, enum: WellStatus })
  @ApiQuery({ name: 'wellType', required: false, enum: WellType })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getNearbyWells(@Query() query: NearbyWellsQueryDto) {
    return this.wellsService.findNearby(query);
  }

  @Get()
  @ApiOperation({ summary: 'List all wells with optional filters' })
  @ApiQuery({ name: 'field', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, enum: WellStatus })
  @ApiQuery({ name: 'wellType', required: false, enum: WellType })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  async getWells(
    @Query('field') field?: string,
    @Query('status') status?: WellStatus,
    @Query('wellType') wellType?: WellType,
    @Query('search') search?: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    return this.wellsService.findAll({ field, status, wellType, search, limit, offset });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get complete well record and summary by UUID or Well ID (e.g. OIL-SYN-001)' })
  async getWellById(@Param('id') id: string) {
    return this.wellsService.findById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.DRILLING_ENGINEER, UserRole.DATA_ENGINEER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new well record (Requires DRILLING_ENGINEER or higher)' })
  async createWell(@Body() body: CreateWellDto) {
    return this.wellsService.create(body);
  }

  @Get(':id/trajectory')
  @ApiOperation({ summary: 'Get ordered trajectory survey points for a well' })
  async getTrajectory(@Param('id') id: string) {
    return this.wellsService.findTrajectory(id);
  }

  @Get(':id/formations')
  @ApiOperation({ summary: 'Get geological formation intervals for a well' })
  async getFormations(@Param('id') id: string) {
    return this.wellsService.findFormations(id);
  }

  @Get(':id/parameters')
  @ApiOperation({ summary: 'Get time-series drilling parameter samples for a well' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getParameters(@Param('id') id: string, @Query('limit') limit?: number) {
    return this.wellsService.findParameters(id, limit);
  }

  @Get(':id/mud')
  @ApiOperation({ summary: 'Get mud logging and rheology samples for a well' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getMud(@Param('id') id: string, @Query('limit') limit?: number) {
    return this.wellsService.findMud(id, limit);
  }

  @Get(':id/events')
  @ApiOperation({ summary: 'Get historical operational events recorded on a well' })
  async getEvents(@Param('id') id: string) {
    return this.wellsService.findEvents(id);
  }

  @Get(':id/documents')
  @ApiOperation({ summary: 'Get associated technical documents (DDR, WCR, Mud Reports)' })
  async getDocuments(@Param('id') id: string) {
    return this.wellsService.findDocuments(id);
  }
}
