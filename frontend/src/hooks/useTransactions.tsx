import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { User, Transaction } from '../@types';
import { httpRequest } from '../api/config';
import { useLocalStorage } from './useStorage';

type TransactionInput = {
  receiver: string;
  value: number;
};

type TransactionsContextData = {
  transactions: Transaction[];
  createTransaction: (data: TransactionInput) => Promise<void>;
};

const TransactionsContext = createContext<TransactionsContextData>({} as TransactionsContextData);

type Props = {
  children: React.ReactNode;
};

export function TransactionsProvider({ children }: Props) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [{ token }] = useLocalStorage<User>('user');

  const fetchTransactions = useCallback(async () => {
    const { data } = await httpRequest.get(`/transactions`, {
      headers: { Authorization: token },
    });
    setTransactions(data);
  }, [token]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const createTransaction = useCallback(
    async (data: TransactionInput) => {
      await httpRequest.post(
        '/transactions',
        {
          creditedUsername: data.receiver,
          amount: data.value,
        },
        { headers: { Authorization: token } },
      );

      fetchTransactions();
    },
    [fetchTransactions, token],
  );

  const contextValues = useMemo(() => ({ transactions, createTransaction }), [transactions, createTransaction]);

  return <TransactionsContext.Provider value={contextValues}>{children}</TransactionsContext.Provider>;
}

export function useTransactions() {
  const context = useContext(TransactionsContext);
  return context;
}
