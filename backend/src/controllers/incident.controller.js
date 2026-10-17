import { Incident } from '../models/Incident.js';
import { createCrud } from '../utils/crudFactory.js';

export const incidentCrud = createCrud(Incident, {
  searchFields: ['incidentId', 'title', 'location.name'],
  filterFields: ['type', 'status', 'priority'],
  dateField: 'occurredAt',
  defaultSort: '-occurredAt',
});
