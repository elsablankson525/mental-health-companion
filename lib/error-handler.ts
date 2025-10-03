import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';

export interface ApiError {
  message: string;
  status: number;
  code?: string;
  details?: any;
}

export class AppError extends Error {
  public status: number;
  public code: string | undefined;
  public details: any;

  constructor(message: string, status: number = 500, code?: string, details?: any) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export function handleApiError(error: unknown): NextResponse {
  console.error('API Error:', error);

  // Handle known Prisma errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002':
        return NextResponse.json(
          { 
            error: 'Duplicate entry', 
            message: 'A record with this information already exists',
            code: 'DUPLICATE_ENTRY'
          },
          { status: 409 }
        );
      case 'P2025':
        return NextResponse.json(
          { 
            error: 'Record not found', 
            message: 'The requested record could not be found',
            code: 'NOT_FOUND'
          },
          { status: 404 }
        );
      case 'P2003':
        return NextResponse.json(
          { 
            error: 'Foreign key constraint', 
            message: 'Invalid reference to related record',
            code: 'FOREIGN_KEY_CONSTRAINT'
          },
          { status: 400 }
        );
      default:
        return NextResponse.json(
          { 
            error: 'Database error', 
            message: 'A database operation failed',
            code: 'DATABASE_ERROR'
          },
          { status: 500 }
        );
    }
  }

  // Handle Prisma connection errors
  if (error instanceof Prisma.PrismaClientInitializationError) {
    return NextResponse.json(
      { 
        error: 'Database connection failed', 
        message: 'Unable to connect to the database',
        code: 'DATABASE_CONNECTION_ERROR'
      },
      { status: 503 }
    );
  }

  // Handle Prisma validation errors
  if (error instanceof Prisma.PrismaClientValidationError) {
    return NextResponse.json(
      { 
        error: 'Validation error', 
        message: 'Invalid data provided',
        code: 'VALIDATION_ERROR'
      },
      { status: 400 }
    );
  }

  // Handle custom AppError
  if (error instanceof AppError) {
    return NextResponse.json(
      { 
        error: error.message,
        code: error.code,
        details: error.details
      },
      { status: error.status }
    );
  }

  // Handle network/connection errors
  if (error instanceof Error) {
    if (error.message.includes('ECONNREFUSED') || error.message.includes('ENOTFOUND')) {
      return NextResponse.json(
        { 
          error: 'Service unavailable', 
          message: 'External service is not available',
          code: 'SERVICE_UNAVAILABLE'
        },
        { status: 503 }
      );
    }

    if (error.message.includes('timeout')) {
      return NextResponse.json(
        { 
          error: 'Request timeout', 
          message: 'The request took too long to process',
          code: 'TIMEOUT'
        },
        { status: 408 }
      );
    }
  }

  // Default error response
  return NextResponse.json(
    { 
      error: 'Internal server error', 
      message: 'An unexpected error occurred',
      code: 'INTERNAL_ERROR'
    },
    { status: 500 }
  );
}

export function withErrorHandler(handler: Function) {
  return async (request: Request, ...args: any[]) => {
    try {
      return await handler(request, ...args);
    } catch (error) {
      return handleApiError(error);
    }
  };
}
