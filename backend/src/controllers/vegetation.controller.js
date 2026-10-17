import { VegetationRecord } from '../models/VegetationRecord.js';
import { createCrud } from '../utils/crudFactory.js';

export const vegetationCrud = createCrud(VegetationRecord, {
  searchFields: ['area', 'source'],
  filterFields: ['zone', 'health'],
  dateField: 'recordedAt',
  defaultSort: '-recordedAt',
});
