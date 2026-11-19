export class RateLimitError extends Error {
  constructor(message = 'Rate limit exceeded') {
    super(message);
    this.name = 'RateLimitError';
  }
}

export class NotFoundError extends Error {
  constructor(message = 'Request failed: 404') {
    super(message);
    this.name = 'NotFoundError';
  }
}
