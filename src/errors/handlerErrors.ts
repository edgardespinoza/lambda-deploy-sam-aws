import { ZodError } from 'zod';
import { Result } from '../application/result';
import { AppError } from './appError';

export const errorHandler = (error: unknown): Result => {
    if (error instanceof ZodError) {
        return { statusCode: 400, body: JSON.stringify({ error: error.errors }) };
    }

    if (error instanceof AppError) {
        return { statusCode: error.statusCode, body: JSON.stringify({ error: error.message }) };
    }

    if (error instanceof Error) {
        return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }

    return { statusCode: 500, body: JSON.stringify({ error: 'Unknown error' }) };
};
