import { deepmerge } from '@hatchgrid/utilities';

export default deepmerge.all(Object.values(import.meta.glob('./*.json', { import: 'default', eager: true })));
