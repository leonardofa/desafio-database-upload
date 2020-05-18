import { getRepository } from 'typeorm';
import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

class GetBalanceService {
  public async execute(): Promise<{
    transactions: Transaction[];
    balance: Balance;
  }> {
    const transactionRepository = getRepository(Transaction);

    const transactions = (await transactionRepository.find({
      relations: ['category'],
    })) as Array<Transaction>;

    const balance = {
      income: 0,
      outcome: 0,
      total: 0,
    };

    transactions.forEach(transaction => {
      // eslint-disable-next-line no-param-reassign
      delete transaction.category_id;
      balance.income += transaction.type === 'income' ? transaction.value : 0;
      balance.outcome += transaction.type === 'outcome' ? transaction.value : 0;
      balance.total +=
        transaction.type === 'income'
          ? transaction.value
          : transaction.value * -1;
    });

    return { transactions, balance };
  }
}

export default GetBalanceService;
