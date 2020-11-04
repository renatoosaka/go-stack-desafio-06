import { getCustomRepository, getRepository } from 'typeorm';

import AppError from '../errors/AppError';

import Category from '../models/Category';
import Transaction from '../models/Transaction';

import TransactionRepository from '../repositories/TransactionsRepository';

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
    const categoryRepository = getRepository(Category);
    const transactionRepository = getCustomRepository(TransactionRepository);

    let category_id = '';

    const balance = await transactionRepository.getBalance();

    if (type === 'outcome' && balance.total - value < 0.0) {
      throw new AppError('You don`t have enough money!');
    }

    const categoryFounded = await categoryRepository.findOne({
      where: {
        title: category,
      },
    });

    if (!categoryFounded) {
      const categoryCreated = categoryRepository.create({
        title: category,
      });

      await categoryRepository.save(categoryCreated);

      category_id = categoryCreated.id;
    } else {
      category_id = categoryFounded.id;
    }

    const transaction = transactionRepository.create({
      title,
      value,
      type,
      category_id,
    });

    await transactionRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
