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
    const { sum: income } = await this.createQueryBuilder()
      .select('SUM(value)')
      .where({
        type: 'income',
      })
      .getRawOne();

    const { sum: outcome } = await this.createQueryBuilder()
      .select('SUM(value)')
      .where({
        type: 'outcome',
      })
      .getRawOne();

    const total = income - outcome;

    return {
      income,
      outcome,
      total,
    };
  }
}

export default TransactionsRepository;
