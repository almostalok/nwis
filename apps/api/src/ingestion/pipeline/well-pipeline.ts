import {
  IDataValidator,
  IDataNormalizer,
  IDataMapper,
  IngestionError,
  WellStatus,
  WellType,
  QualityStatus,
  CreateWellDto,
} from '@nwis/types';
import { createWellSchema } from '@nwis/validation';
import { UnitNormalizer } from '@nwis/utils';

export class WellDataValidator implements IDataValidator<any> {
  validate(record: any, index: number = 0): { isValid: boolean; errors: IngestionError[]; record: any } {
    const result = createWellSchema.safeParse({
      ...record,
      wellType: record.wellType || WellType.DEVELOPMENT,
      status: record.status || WellStatus.DRILLING,
      totalDepth: Number(record.totalDepth),
      latitude: Number(record.latitude),
      longitude: Number(record.longitude),
    });

    if (!result.success) {
      const errors: IngestionError[] = result.error.errors.map((e) => ({
        rowNumber: index + 1,
        recordIdentifier: record.wellId || `row-${index + 1}`,
        field: e.path.join('.'),
        message: e.message,
        rawData: record,
        severity: 'ERROR',
      }));
      return { isValid: false, errors, record };
    }

    return { isValid: true, errors: [], record: result.data };
  }
}

export class WellDataNormalizer implements IDataNormalizer<any, any> {
  normalize(record: any): any {
    const depthUnit = (record.depthUnit || 'm').toLowerCase();
    const normalizedDepth = UnitNormalizer.depthToMeters(Number(record.totalDepth), depthUnit);

    return {
      ...record,
      totalDepth: normalizedDepth,
      wellId: String(record.wellId).trim().toUpperCase(),
      name: String(record.name).trim(),
      field: String(record.field || 'NWIS-DEMO-FIELD').trim(),
      operator: String(record.operator || 'Oil India Limited (Synthetic)').trim(),
      latitude: Number(record.latitude),
      longitude: Number(record.longitude),
      qualityStatus: record.qualityStatus || QualityStatus.VALID,
      qualityScore: record.qualityScore !== undefined ? Number(record.qualityScore) : 1.0,
    };
  }
}

export class WellDataMapper implements IDataMapper<any, CreateWellDto> {
  map(input: any): CreateWellDto {
    return {
      wellId: input.wellId,
      name: input.name,
      field: input.field,
      operator: input.operator,
      wellType: input.wellType as WellType,
      status: input.status as WellStatus,
      spudDate: input.spudDate ? new Date(input.spudDate).toISOString() : null,
      completionDate: input.completionDate ? new Date(input.completionDate).toISOString() : null,
      totalDepth: input.totalDepth,
      latitude: input.latitude,
      longitude: input.longitude,
      qualityStatus: input.qualityStatus,
      qualityScore: input.qualityScore,
      sourceId: input.sourceId || null,
    };
  }
}
