import { Router } from 'express';

import multer from 'multer';
import { getRepository } from 'typeorm';
import GetBalanceService from '../services/GetBalanceService';
import CreateTransactionService from '../services/CreateTransactionService';
import DeleteTransactionService from '../services/DeleteTransactionService';
import ImportTransactionsService from '../services/ImportTransactionsService';

import uploadConfig from '../config/uploadcsv';
import Transaction from '../models/Transaction';

const upload = multer(uploadConfig);

const transactionsRouter = Router();

transactionsRouter.get('/', async (request, response) => {
  const getBalanceService = new GetBalanceService();
  return response.json(await getBalanceService.execute());
});

transactionsRouter.post('/', async (request, response) => {
  const createTransactionService = new CreateTransactionService();
  const { title, value, type, category } = request.body;
  return response.json(
    await createTransactionService.execute({ title, value, type, category }),
  );
});

transactionsRouter.delete('/:id', async (request, response) => {
  const { id } = request.params;
  const deleteTransactionService = new DeleteTransactionService();
  await deleteTransactionService.execute(id);
  return response.status(204).send();
});

transactionsRouter.delete('/', async (request, response) => {
  const transaciontRepository = getRepository(Transaction);
  const transactions = await transaciontRepository.find();
  await transaciontRepository.remove(transactions);
  return response.status(204).send();
});

transactionsRouter.post(
  '/import',
  upload.single('file'),
  async (request, response) => {
    const importTransactionsService = new ImportTransactionsService();
    return response.json(
      await importTransactionsService.execute(request.file.filename),
    );
  },
);

export default transactionsRouter;
