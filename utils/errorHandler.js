export function handleError(err, res) {
    console.error(err);
    res.status(500).json({ error: err.message });
} 