import { format, parseISO } from 'date-fns';

export interface Transaction {
  externalId: string;
  aisType: string;
  accountId: string;
  accountName: string;
  accountIdentity: string;
  currency: string;
  amount: number;
  bookingDate: string;
  valueDate: string;
  bankTransactionCode: string;
  proprietaryBankTransactionCode: string;
  remittanceInformationUnstructured: string;
  creditorAccount: Record<string, never>;
  debtorAccount: {
    identity: string;
    iban: string;
    bban: string;
    currency: string;
  };
  accountIban: string;
  operationId: string;
  entryReference: string;
  endToEndId: string;
  debtorBic?: string;
  creditorBic?: string;
  purposeCode?: string;
}

export interface CategoryData {
  name: string;
  value: number;
}

export interface DailySpending {
  date: string;
  amount: number;
}

export interface MonthlySpending {
  date: string;
  amount: number;
}

export function processTransactions(transactions: Transaction[]) {
  const monthlySpending = processMonthlySpending(transactions);
  const expenseCategories = processExpenseCategories(transactions);
  const dailySpending = processDailySpending(transactions);

  return {
    monthlySpending,
    expenseCategories,
    dailySpending,
    transactions: transactions.sort((a, b) => 
      new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime()
    )
  };
}

function processMonthlySpending(transactions: Transaction[]): MonthlySpending[] {
  const monthlyData: { [key: string]: number } = {};
  
  transactions.forEach(transaction => {
    const date = parseISO(transaction.bookingDate);
    const monthKey = format(date, 'yyyy-MM');
    
    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = 0;
    }
    
    monthlyData[monthKey] += Math.abs(transaction.amount);
  });

  return Object.entries(monthlyData)
    .map(([date, amount]) => ({ date, amount }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

function processExpenseCategories(transactions: Transaction[]): CategoryData[] {
  const categoryMap: { [key: string]: number } = {};
  
  transactions.forEach(transaction => {
    if (transaction.amount < 0) {
      const category = getCategoryFromTransaction(transaction);
      if (!categoryMap[category]) {
        categoryMap[category] = 0;
      }
      categoryMap[category] += Math.abs(transaction.amount);
    }
  });

  const total = Object.values(categoryMap).reduce((sum, amount) => sum + amount, 0);
  
  return Object.entries(categoryMap)
    .map(([name, value]) => ({
      name,
      value: (value / total) * 100
    }))
    .sort((a, b) => b.value - a.value);
}

function processDailySpending(transactions: Transaction[]): DailySpending[] {
  const dailyData: { [key: string]: number } = {};
  
  transactions.forEach(transaction => {
    if (transaction.amount < 0) {
      const date = format(parseISO(transaction.bookingDate), 'yyyy-MM-dd');
      if (!dailyData[date]) {
        dailyData[date] = 0;
      }
      dailyData[date] += Math.abs(transaction.amount);
    }
  });

  return Object.entries(dailyData)
    .map(([date, amount]) => ({ date, amount }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function getCategoryFromTransaction(transaction: Transaction): string {
  const description = transaction.remittanceInformationUnstructured.toLowerCase();
  const purposeCode = transaction.purposeCode?.toLowerCase() || '';

  if (description.includes('ola') || description.includes('uber')) {
    return 'Transportation';
  } else if (description.includes('zomato') || description.includes('swiggy')) {
    return 'Food & Dining';
  } else if (description.includes('landlord')) {
    return 'Rent';
  } else if (description.includes('salary') || description.includes('company')) {
    return 'Salary';
  } else if (purposeCode === 'CASH') {
    return 'Cash Withdrawal';
  } else if (purposeCode === 'BKDF') {
    return 'Bank Transfer';
  } else if (transaction.amount < 0) {
    return 'Expense';
  } else {
    return 'Income';
  }
} 