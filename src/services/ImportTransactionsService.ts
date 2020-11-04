import path from 'path';
import csvParse from 'csv-parse';
import fs from 'fs';

import CreateTransactionService from './CreateTransactionService';

import Transaction from '../models/Transaction';

import uploadConfig from '../config/upload';

interface Request {
  filename: string;
}

interface TransactionObject {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}
class ImportTransactionsService {
  async loadCSV(filepath: string): Promise<TransactionObject[]> {
    const readCSVStream = fs.createReadStream(filepath);

    const parseStream = csvParse({
      from_line: 2,
      ltrim: true,
      rtrim: true,
    });

    const parseCSV = readCSVStream.pipe(parseStream);

    const transactions: TransactionObject[] = [];

    parseCSV.on('data', line => {
      const [title, type, value, category] = line;
      transactions.push({
        title,
        type,
        value: parseFloat(value),
        category,
      });
    });

    await new Promise(resolve => {
      parseCSV.on('end', resolve);
    });

    return transactions;
  }

  async execute({ filename }: Request): Promise<Transaction[]> {
    const csvFilePath = path.join(uploadConfig.directory, filename);
    const transactionsCSV = await this.loadCSV(csvFilePath);

    const createTransaction = new CreateTransactionService();

    const transactions: Transaction[] = [];

    const promises = transactionsCSV.map(async t => {
      const transaction = await createTransaction.execute(t);

      transactions.push(transaction);
    });

    await Promise.all(promises);

    return transactions;
  }
}

export default ImportTransactionsService;
