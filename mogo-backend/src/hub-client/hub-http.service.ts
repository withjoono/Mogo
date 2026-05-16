import {
  Injectable,
  Logger,
  HttpException,
  HttpStatus,
  InternalServerErrorException,
  ServiceUnavailableException,
} from '@nestjs/common';

interface HubFetchOptions {
  method: 'GET' | 'POST' | 'DELETE' | 'PATCH' | 'PUT';
  path: string;
  headers: Record<string, string>;
  body?: unknown;
  /** 기본 8000ms. 외부 호출 차단 방지. */
  timeoutMs?: number;
  /** 5xx 재시도 횟수 (지수 백오프). 기본 2. 401/4xx는 재시도하지 않음. */
  retries?: number;
}

/**
 * Hub HTTP 호출 공통 래퍼.
 * - 타임아웃(AbortController)
 * - 5xx 재시도(지수 백오프 100ms, 300ms)
 * - 4xx는 그대로 HttpException으로 throw해서 호출자/클라이언트에 전달
 *   (401이면 SSO 재로그인 유도, 404는 NotFoundException 등으로 변환됨)
 */
@Injectable()
export class HubHttpService {
  private readonly logger = new Logger(HubHttpService.name);

  get baseUrl(): string {
    return process.env.HUB_BASE_URL || 'http://localhost:4000';
  }

  async request<T>(opts: HubFetchOptions): Promise<T> {
    const url = `${this.baseUrl}${opts.path}`;
    const retries = opts.retries ?? 2;
    const timeoutMs = opts.timeoutMs ?? 8000;

    let lastErr: unknown;
    for (let attempt = 0; attempt <= retries; attempt++) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);
      try {
        const res = await fetch(url, {
          method: opts.method,
          headers: { 'Content-Type': 'application/json', ...opts.headers },
          body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
          signal: controller.signal,
        });
        clearTimeout(timer);

        if (res.ok) {
          if (res.status === 204) return undefined as T;
          return (await res.json()) as T;
        }

        // 5xx → 재시도 대상
        if (res.status >= 500 && attempt < retries) {
          this.logger.warn(`Hub 5xx ${res.status} on ${opts.method} ${opts.path} (attempt ${attempt + 1}/${retries + 1})`);
          await this.backoff(attempt);
          continue;
        }

        // 4xx 또는 재시도 소진된 5xx → 그대로 throw
        const errBody = await this.safeJson(res);
        const msg = (errBody && (errBody.message || errBody.error)) || res.statusText;
        throw new HttpException(
          { statusCode: res.status, message: msg, hub: true },
          res.status as HttpStatus,
        );
      } catch (err) {
        clearTimeout(timer);
        if (err instanceof HttpException) throw err;
        lastErr = err;
        if (attempt < retries && this.isTransient(err)) {
          this.logger.warn(`Hub transient error on ${opts.method} ${opts.path} (attempt ${attempt + 1}): ${(err as Error).message}`);
          await this.backoff(attempt);
          continue;
        }
        break;
      }
    }

    this.logger.error(`Hub call failed: ${opts.method} ${opts.path}`, lastErr as Error);
    if ((lastErr as Error)?.name === 'AbortError') {
      throw new ServiceUnavailableException('Hub timeout');
    }
    throw new InternalServerErrorException('Hub call failed');
  }

  private isTransient(err: unknown): boolean {
    if (!err) return false;
    const e = err as Error & { code?: string };
    return e.name === 'AbortError' || e.code === 'ECONNRESET' || e.code === 'ETIMEDOUT' || e.code === 'EAI_AGAIN';
  }

  private backoff(attempt: number): Promise<void> {
    const delay = 100 * Math.pow(3, attempt);
    return new Promise((r) => setTimeout(r, delay));
  }

  private async safeJson(res: Response): Promise<any> {
    try { return await res.json(); } catch { return null; }
  }
}
