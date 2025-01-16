const {
  fillMissingDates,
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
      dailySales[entry.productId] = dailySales[entry.productId] = {};
    }

    if (!dailySales[entry.productId][dateKey]) {
      dailySales[entry.productId][dateKey] = 0;
    }

    dailySales[entry.productId][dateKey] += entry.stockChange;
  });

  // Isi tanggal yang kosong
  Object.keys(dailySales).forEach((productId) => {
    dailySales[productId] = fillMissingDates(dailySales[productId]);
  });

  // Calculate statistics for each product
  const predictions = Object.keys(dailySales).map((product) => {
    const numberOfDaysInAWeek = 7;
    const sales = Object.values(dailySales[product]);
    const predictedSales = new Array(numberOfDaysInAWeek);
    const saleClassifications = new Array(numberOfDaysInAWeek);
    const saleMeans = new Array(numberOfDaysInAWeek);
    const saleStandardDeviations = new Array(numberOfDaysInAWeek);

    //let daysRecorded = null;

    for (let i = 0; i < numberOfDaysInAWeek; i++) {
      saleMeans[i] = math.mean(sales);
      saleStandardDeviations[i] = math.std(sales);
      //daysRecorded = sales.length;
      saleClassifications[i] = classifyProduct(
        saleMeans[i],
        saleStandardDeviations[i]
      );

      if (saleClassifications[i] === 'stable') {
        predictedSales[i] = Math.round(predictMean(saleMeans[i]));
      } else if (saleClassifications[i] === 'trending') {
        predictedSales[i] = Math.round(
          predictTrendingWithExponentialSmoothing(sales)
        );
      } else {
        predictedSales[i] = Math.round(predictMovingAverage(sales));
      }

      sales.push(predictedSales[i]);
    }

    return {
      productId: product,
      predictedSales,
    };
  });

  return res.status(200).json({
    status: 'success',
    message: 'Sales forecast retrieved successfully.',
    data: predictions,
  });
};

module.exports = { getSalesForecast };
