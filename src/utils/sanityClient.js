import { createClient } from '@sanity/client';

export default createClient({
  projectId: 'xgb8fdxb',
  dataset: 'production',
  useCdn: true,
  apiVersion: '2023-07-26',
});