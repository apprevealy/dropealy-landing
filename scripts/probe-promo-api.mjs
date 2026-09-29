// Diagnóstico público e somente de leitura. Não abre checkouts nem altera cadastros.
import { writeFileSync } from 'node:fs';
const url = 'https://app.dropealy.com/api/public/promo-creator/presente';
const result = { checkedAt: new Date().toISOString(), url, confirmedPublished: false };
try {
  const response = await fetch(url, { redirect: 'manual', signal: AbortSignal.timeout(8000), headers: { Accept: 'application/json', Origin: 'https://www.dropealy.com' } });
  result.httpStatus = response.status;
  result.contentType = response.headers.get('content-type');
  result.accessControlAllowOrigin = response.headers.get('access-control-allow-origin');
  result.cacheControl = response.headers.get('cache-control');
  if (result.contentType?.includes('application/json')) {
    const data = await response.json();
    result.published = data?.status === 'published';
    result.matchingSlug = data?.slug === 'presente';
    result.hasThreeCheckouts = ['starter', 'trial', 'master'].every(plan => typeof data?.checkout?.[plan] === 'string');
    result.confirmedPublished = response.status === 200 && result.published && result.matchingSlug && result.hasThreeCheckouts;
  }
} catch (error) { result.error = error.name; }
writeFileSync('promo-api-check.json', JSON.stringify(result, null, 2));
console.log(JSON.stringify(result));
// API indisponível não impede testes com dados simulados, mas impede liberar produção.
