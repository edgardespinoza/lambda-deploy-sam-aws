import { z } from 'zod';

export const schema = z.object({
    id: z.string().uuid(),
    month: z.number().min(1).max(12),
    year: z.number().min(2000).max(2100),
    room: z.string().min(1),
    meter: z.number().min(0),
    local: z.string().min(1),
});

export const schemaUpdate = z.object({
    month: z.number().min(1).max(12),
    year: z.number().min(2000).max(2100),
    room: z.string().min(1),
    meter: z.number().min(0),
    local: z.string().min(1),
});

export const querySchema = z.object({
    local: z.string(),
    year: z
        .string()
        .regex(/^\d{4}$/)
        .transform(Number),
    month: z
        .string()
        .regex(/^\d{1,2}$/)
        .transform(Number)
        .refine((val) => val >= 1 && val <= 12, {
            message: 'Month must be between 1 and 12',
        }),
});
