import { IDataParser } from '@nwis/types';

export class JsonDataParser implements IDataParser<string, any> {
  parse(raw: string): any[] {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [parsed];
  }
}

export class CsvDataParser implements IDataParser<string, any> {
  parse(raw: string): any[] {
    const lines = raw.trim().split(/\r?\n/).filter((l) => l.trim().length > 0);
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map((h) => h.trim());
    const records: any[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map((v) => v.trim());
      const row: Record<string, any> = {};
      for (let j = 0; j < headers.length; j++) {
        const val = values[j];
        if (val === undefined || val === '') {
          row[headers[j]] = null;
        } else if (!isNaN(Number(val))) {
          row[headers[j]] = Number(val);
        } else if (val.toLowerCase() === 'true') {
          row[headers[j]] = true;
        } else if (val.toLowerCase() === 'false') {
          row[headers[j]] = false;
        } else {
          row[headers[j]] = val;
        }
      }
      records.push(row);
    }

    return records;
  }
}
