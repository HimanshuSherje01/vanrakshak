import { Dataset } from '../models/Dataset.js';
import { MLModel } from '../models/MLModel.js';
import { createCrud } from '../utils/crudFactory.js';

export const datasetCrud = createCrud(Dataset, { searchFields: ['name', 'source', 'type'], filterFields: ['status'], defaultSort: 'name' });
export const modelCrud = createCrud(MLModel, { searchFields: ['name'], filterFields: ['status'], defaultSort: 'name' });
