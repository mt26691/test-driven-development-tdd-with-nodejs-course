export class AppError extends Error {
  readonly statusCode: number;
  readonly error: string;

  constructor(statusCode: number, error: string, message: string) {
    super(message);
    this.name = new.target.name;
    this.statusCode = statusCode;
    this.error = error;
  }
}

export class NotFoundError extends AppError {
  constructor(message: string) {
    super(404, "Not Found", message);
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(400, "Bad Request", message);
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(409, "Conflict", message);
  }
}
