import path from 'path';
import fs from 'fs';
import csvParse from 'csv-parse';
import Transaction from '../models/Transaction';
import uploadConfig from '../config/uploadcsv';
import CreateTransactionService from './CreateTransactionService';

class ImportTransactionsService {
  async execute(fileName: string): Promise<any> {
    const csvFilePath = path.join(uploadConfig.destination, fileName);

    const readCSVStream = fs.createReadStream(csvFilePath);
    const parseStream = csvParse({
      from_line: 2,
      ltrim: true,
      rtrim: true,
    });
    const parseCSV = readCSVStream.pipe(parseStream);

    const transactionsIncome = new Array<{
      title: string;
      type: 'income' | 'outcome';
      value: number;
      category: string;
    }>();

    const transactionsOutcome = new Array<{
      title: string;
      type: 'income' | 'outcome';
      value: number;
      category: string;
    }>();

    await parseCSV.on('data', line => {
      const [title, type, value, category] = line;
      if (type === 'income') {
        transactionsIncome.push({ title, type, value, category });
      }
      if (type === 'outcome') {
        transactionsOutcome.push({ title, type, value, category });
      }
    });

    await new Promise(resolve => {
      parseCSV.on('end', resolve);
    });

    const transactions = new Array<Transaction>();

    const promisesTransactionsIncome = transactionsIncome.map(
      async transaction => {
        const { title, type, value, category } = transaction;
        transactions.push(
          await new CreateTransactionService().execute({
            title,
            type,
            value: Number(value),
            category,
          }),
        );
      },
    );
    await Promise.all(promisesTransactionsIncome).catch(err =>
      console.log(err),
    );

    const promisesTransactionsOutCome = transactionsOutcome.map(
      async transaction => {
        const { title, type, value, category } = transaction;
        transactions.push(
          await new CreateTransactionService().execute({
            title,
            type,
            value: Number(value),
            category,
          }),
        );
      },
    );
    await Promise.all(promisesTransactionsOutCome).catch(err =>
      console.log(err),
    );

    await fs.promises.unlink(csvFilePath);

    return transactions;
  }
}

export default ImportTransactionsService;
