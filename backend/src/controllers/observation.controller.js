import { Observation } from '../models/Observation.js';
import { createCrud } from '../utils/crudFactory.js';

export const observationCrud = createCrud(Observation, {
  searchFields: ['species', 'location.name', 'notes'],
  filterFields: ['category', 'source'],
  dateField: 'observedAt',
  defaultSort: '-observedAt',
});
