export class BaseCustomError extends Error {
  title: string;
  status: number;
  errors?: Record<string, string>;
  timestamp: string;
  trace?: Array<{ function: string; location: string }>;
  cause?: unknown;

  constructor(message: string, options: {
    title?: string;
    status?: number;
    errors?: Record<string, string>;
    trace?: Array<{ function: string; location: string }>;
    cause?: unknown;  // Add to options interface
  } = {}) {
    super(message);

    // Ensure instanceof works correctly
    Object.setPrototypeOf(this, BaseCustomError.prototype);

    // Set name for the error
    this.name = this.constructor.name;

    // Set custom properties
    this.title = options.title || 'Server Error';
    this.status = options.status || 500;
    this.errors = options.errors;
    this.timestamp = new Date().toISOString();
    this.trace = options.trace;
    this.cause = options.cause;  // Set the cause property
  }

  // Optional: Method to serialize the error for logging/response
  toJSON() {
    return {
      name: this.name,
      title: this.title,
      status: this.status,
      message: this.message,
      errors: this.errors,
      timestamp: this.timestamp,
      trace: this.trace,
      cause: this.cause  // Add to JSON output
    };
  }
}
