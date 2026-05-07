import * as z from 'zod'

export const loginSchema = z.object({
    email: z.email("Invalid email").trim(),
    password: z.string()
        .trim()
        .regex(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[$@$!%*?&])[A-Za-z\d$@$!%*?&]{8,}$/,
            "Invalid password"
        ),
});

export const registerSchema = z.object({
    name: z.string("Name must be a string").trim().min(1, { message: "Name is required" }),
    email: z.email("Invalid email").trim(),
    password: z.string()
        .trim()
        .regex(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[$@$!%*?&])[A-Za-z\d$@$!%*?&]{8,}$/,
            "Include uppercase letters, lowercase letters, numbers, and special characters @$!%*?&"
        ),
});

export const rescuePassSchema1 = z.object({
    email: z.email("Invalid email").trim(),
});

export const rescuePassSchema2 = z.object({
    email: z.email("Invalid email").trim(),
    password: z.string()
        .trim()
        .regex(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[$@$!%*?&])[A-Za-z\d$@$!%*?&]{8,}$/,
            "Include uppercase letters, lowercase letters, numbers, and special characters @$!%*?&"
        ),
});

