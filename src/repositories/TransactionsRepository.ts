import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const { sum: incomeSum } = await this.createQueryBuilder()
      .select('SUM(value)')
      .where({
        type: 'income',
      })
      .getRawOne();

    const { sum: outcomeSum } = await this.createQueryBuilder()
      .select('SUM(value)')
      .where({
        type: 'outcome',
      })
      .getRawOne();

    const income: number = parseFloat(incomeSum) || 0.0;
    const outcome: number = parseFloat(outcomeSum) || 0.0;
    const total: number = income - outcome;

    return {
      income,
      outcome,
      total,
    };
  }
}

export default TransactionsRepository;
