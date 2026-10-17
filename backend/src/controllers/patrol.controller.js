import { Patrol } from '../models/Patrol.js';
import { createCrud } from '../utils/crudFactory.js';

export const patrolCrud = createCrud(Patrol, {
  searchFields: ['name', 'team'],
  filterFields: ['status', 'zone'],
  dateField: 'date',
  defaultSort: '-date',
});
