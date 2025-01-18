const {
  fillMissingDates,
  groupDataByDayOfWeek,
  classifyProduct,
  predictMean,
  predictMovingAverage,
  predictTrendingWithExponentialSmoothing,
} = require('../helpers/forecastHelpers');

const math = require('mathjs');

const getSalesForecast = async (req, res) => {
  const inventoryLogs = req.inventoryLogs;

  let dailySales = {};

  inventoryLogs.forEach((entry) => {
    const [dateKey] = entry.createdAt.split(','); // Ambil bagian tanggal saja

    if (!dailySales[entry.productId]) {
      dailySales[entry.productId] = {};
    }

    if (!dailySales[entry.productId][dateKey]) {
      dailySales[entry.productId][dateKey] = 0;
    }

    dailySales[entry.productId][dateKey] += entry.stockChange;
  });

  // Isi tanggal yang kosong
  dailySales = groupDataByDayOfWeek(fillMissingDates(dailySales));

  // Calculate statistics for each product
  const predictions = Object.keys(dailySales).map((product) => {
    const numberOfDaysInAWeek = 7;
    const predictedSales = new Array(numberOfDaysInAWeek);
    const sales = Object.values(dailySales[product]);
    const saleDays = Object.keys(dailySales[product]);
    const saleClassifications = new Array(numberOfDaysInAWeek);
    const saleMeans = new Array(numberOfDaysInAWeek);
    const saleStandardDeviations = new Array(numberOfDaysInAWeek);

    for (let i = 0; i < numberOfDaysInAWeek; i++) {
      saleMeans[i] = math.mean(sales[i]);
      saleStandardDeviations[i] = math.std(sales[i]);
      saleClassifications[i] = classifyProduct(
        saleMeans[i],
        saleStandardDeviations[i]
      );

      if (saleClassifications[i] === 'stable') {
        predictedSales[i] = Math.round(predictMean(saleMeans[i]));
      } else if (saleClassifications[i] === 'trending') {
        predictedSales[i] = Math.round(
          predictTrendingWithExponentialSmoothing(sales[i])
        );
      } else {
        predictedSales[i] = Math.round(predictMovingAverage(sales[i]));
      }

      dailySales[product][saleDays[i]] = predictedSales[i];
    }

    //console.log(saleClassifications);

    const products = req.products;

    if (!products[product]) {
      return;
    }

    const restockThreshold = products[product].restockThreshold;
    let stockLevel = products[product].stockLevel;
    let predictedRestockDay = null;

    let days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
    const today = new Date().getDay();

    const k = days.length - today;
    const reverse = (left, right) => {
      while (left < right) {
        [days[left], days[right]] = [days[right], days[left]];
        left++, right--;
      }
    };

    reverse(0, days.length - 1);
    reverse(0, k - 1);
    reverse(k, days.length - 1);

    for (const day of days) {
      stockLevel -= dailySales[product][day];
      if (stockLevel < restockThreshold) {
        predictedRestockDay = day;
        break;
      }
    }

    return {
      productId: product,
      predictedSales: dailySales[product],
      predictedRestockDay,
    };
  });

  return res.status(200).json({
    status: 'success',
    message: 'Sales forecast retrieved successfully.',
    data: predictions,
  });
};

module.exports = { getSalesForecast };
