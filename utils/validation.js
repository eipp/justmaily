export function validateRequest(req) {
    if (!req.body || typeof req.body !== 'object') {
        throw new Error('Invalid request body');
    }
    return true;
} 