const math = require('mathjs');

const fillMissingDates = (data) => {
  // Konversi data menjadi array tanggal
  const dates = Object.keys(data).map((date) => {
    // Konversi ke format ISO untuk mempermudah pengurutan dan manipulasi
    const [day, month, year] = date.split('/');
    return new Date(`${year}-${month}-${day}`);
  });

  // Cari tanggal terlama dan terkini
  const earliestDate = new Date(Math.min(...dates));
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  // Objek hasil baru
  const filledData = { ...data };

  // Iterasi dari tanggal terlama hingga hari ini
  for (
    let current = new Date(earliestDate);
    current <= yesterday;
    current.setDate(current.getDate() + 1)
  ) {
    // Format tanggal kembali ke "dd/mm/yyyy"
    const day = current.getDate().toString().padStart(2, '0');
    const month = (current.getMonth() + 1).toString().padStart(2, '0');
    const year = current.getFullYear();
    const formattedDate = `${day}/${month}/${year}`;

    // Jika tanggal tidak ada, tambahkan dengan nilai 0
    if (!filledData[formattedDate]) {
      filledData[formattedDate] = 0;
    }
  }

  // Kembalikan hasil dengan tanggal terurut
  return Object.fromEntries(
    Object.entries(filledData).sort(([dateA], [dateB]) => {
      const [dayA, monthA, yearA] = dateA.split('/');
      const [dayB, monthB, yearB] = dateB.split('/');
      return (
        new Date(`${yearA}-${monthA}-${dayA}`) -
        new Date(`${yearB}-${monthB}-${dayB}`)
      );
    })
  );
};

// Fungsi untuk mendapatkan nama hari
const getDayOfWeek = (dateStr) => {
  const [day, month, year] = dateStr.split('/');
  const date = new Date(`${year}-${month}-${day}`);
  const daysOfWeek = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  return daysOfWeek[date.getDay()];
};

const groupDataByDayOfWeek = (data) => {
  // Objek hasil
  const groupedData = {};

  // Iterasi setiap produk dalam data
  Object.keys(data).forEach((productId) => {
    const productData = data[productId];
    groupedData[productId] = {
      mon: [],
      tue: [],
      wed: [],
      thu: [],
      fri: [],
      sat: [],
      sun: [],
    };

    // Iterasi setiap tanggal dan nilai penjualan
    Object.entries(productData).forEach(([date, value]) => {
      const dayOfWeek = getDayOfWeek(date); // Dapatkan nama hari
      groupedData[productId][dayOfWeek].push(value); // Tambahkan nilai ke hari yang sesuai
    });
  });

  return groupedData;
};

// Classification function
const classifyProduct = (mean, stdDev) => {
  const stabilityThreshold = 0.3; // Coefficient of Variation threshold
  if (stdDev / mean <= stabilityThreshold) {
    return 'stable';
  } else if (mean > 0 && stdDev > 0) {
    return 'trending';
  } else {
    return 'fluctuating';
  }
};

// Prediction methods
const predictMean = (mean) => {
  return mean;
};

const predictMovingAverage = (sales, window = 3) => {
  const recentSales = sales.slice(-window);
  return math.mean(recentSales);
};

const predictTrendingWithExponentialSmoothing = (sales, alpha = 0.3) => {
  if (sales.length === 0) return 0;

  let smoothedValue = sales[0]; // Mulai dengan nilai pertama sebagai baseline

  for (let t = 1; t < sales.length; t++) {
    smoothedValue = alpha * sales[t] + (1 - alpha) * smoothedValue;
  }

  return Math.max(0, smoothedValue); // Hindari nilai negatif
};

module.exports = {
  fillMissingDates,
  getDayOfWeek,
  groupDataByDayOfWeek,
  classifyProduct,
  predictMean,
  predictMovingAverage,
  predictTrendingWithExponentialSmoothing,
};
