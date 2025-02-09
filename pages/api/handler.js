import { validateRequest } from '../../utils/validation';
import { processBusinessLogic } from '../../utils/businessLogic';
import { handleError } from '../../utils/errorHandler';

export default async function handler(req, res) {
  try {
    validateRequest(req);
    const result = await processBusinessLogic(req.body);
    res.status(200).json(result);
  } catch (err) {
    handleError(err, res);
  }
}
