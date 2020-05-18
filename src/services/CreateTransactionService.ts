import { getRepository } from 'typeorm';
import AppError from '../errors/AppError';
import Transaction, { TypeTransaction } from '../models/Transaction';
import GetBalanceService from './GetBalanceService';
import GetCategoryAndSaveIfNotExistsService from './GetCategoryAndSaveIfNotExistsService';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    if (!title) {
      throw new AppError('Title is required');
    }

    if (!value) {
      throw new AppError('Value is required');
    }

    if (typeof value !== 'number' || value <= 0) {
      throw new AppError('Value is not valid');
    }

    if (!type) {
      throw new AppError('Type is required');
    }

    if (type !== 'income' && type !== 'outcome') {
      throw new AppError('Type is not valid');
    }

    const getBalanceService = new GetBalanceService();
    const balance = await (await getBalanceService.execute()).balance;
    if (type === 'outcome' && balance.total < value) {
      throw new AppError('There is no value to outcome transaction');
    }

    const typeTransaction =
      type === 'income' ? TypeTransaction.INCOME : TypeTransaction.OUTCOME;

    const getCategoryAndSaveIfNotExistsService = new GetCategoryAndSaveIfNotExistsService();
    const categoryDb = await getCategoryAndSaveIfNotExistsService.execute(
      category,
    );

    const transactionRepository = getRepository(Transaction);

    const transaction = transactionRepository.create({
      title,
      category: categoryDb,
      type: typeTransaction,
      value,
    });

    return transactionRepository.save(transaction);
  }
}

export default CreateTransactionService;
