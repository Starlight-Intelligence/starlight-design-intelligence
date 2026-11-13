import { fileURLToPath } from 'node:url';
export default { poweredByHeader: false, outputFileTracingRoot: fileURLToPath(new URL('.', import.meta.url)) };
