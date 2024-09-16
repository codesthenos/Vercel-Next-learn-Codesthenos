import { QueryResult } from '@vercel/postgres';
import { Revenue } from './definitions';

export const formatCurrency = (amount: number) => {
  return (amount / 100).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
  });
};

export const formatDateToLocal = (
  dateStr: string,
  locale: string = 'en-US',
) => {
  const date = new Date(dateStr);
  const options: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  };
  const formatter = new Intl.DateTimeFormat(locale, options);
  return formatter.format(date);
};

export const generateYAxis = (revenue: Revenue[]) => {
  // Calculate what labels we need to display on the y-axis
  // based on highest record and in 1000s
  const yAxisLabels = [];
  const highestRecord = Math.max(...revenue.map((month) => month.revenue));
  const topLabel = Math.ceil(highestRecord / 1000) * 1000;

  for (let i = topLabel; i >= 0; i -= 1000) {
    yAxisLabels.push(`$${i / 1000}K`);
  }

  return { yAxisLabels, topLabel };
};

export const generatePagination = (currentPage: number, totalPages: number) => {
  // If the total number of pages is 7 or less,
  // display all pages without any ellipsis.
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  // If the current page is among the first 3 pages,
  // show the first 3, an ellipsis, and the last 2 pages.
  if (currentPage <= 3) {
    return [1, 2, 3, '...', totalPages - 1, totalPages];
  }

  // If the current page is among the last 3 pages,
  // show the first 2, an ellipsis, and the last 3 pages.
  if (currentPage >= totalPages - 2) {
    return [1, 2, '...', totalPages - 2, totalPages - 1, totalPages];
  }

  // If the current page is somewhere in the middle,
  // show the first page, an ellipsis, the current page and its neighbors,
  // another ellipsis, and the last page.
  return [
    1,
    '...',
    currentPage - 1,
    currentPage,
    currentPage + 1,
    '...',
    totalPages,
  ];
};

export const getHtml = (newData: QueryResult<{
  id: string;
  name: string;
  email: string;
  date: string;
  amount: number;
  status: "pending" | "paid";
  image_url: string;
}>) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invoices</title>
</head>
<body>
  <h1 style='text-align: center;'>Invoices</h1>

  ${newData.rows.map(row => {
    return`
  <article style='display: flex; flex-direction: column; gap: 8px; justify-content: center; align-items: center; width: 90vw; height: 90vh;'>
    <div style='display: flex; justify-content: space-between; align-items: center; min-width: 400px'>
      <h3>Date:</h3>
      <p>${row.date.toString().split(' ').slice(0, 4).join('/')}<p>
    </div>
    <div style='display: flex; justify-content: space-between; align-items: center; min-width: 400px'>
      <h3>Status:</h3>
      <p>${row.status}<p>
    </div>
    <div style='display: flex; justify-content: space-between; align-items: center; min-width: 400px'>
      <h3>Amount:</h3>
      <p>${row.amount / 100}$<p>
    </div>
    <div style='display: flex; justify-content: space-between; align-items: center; min-width: 400px'>
      <h3>Name:</h3>
      <p>${row.name}<p>
    </div>
    <div style='display: flex; justify-content: space-between; align-items: center; min-width: 400px'>
      <h3>Email:</h3>
      <p>${row.email}<p>
    </div>
    <div style='display: flex; justify-content: space-between; align-items: center; min-width: 400px'>
      <h3>Invoice Id:</h3>
      <p>${row.id}<p>
    </div>
  </article>    
  `
      }).join('\n-------------------------------------------------------------\n')}
</body>
</html>
`
}