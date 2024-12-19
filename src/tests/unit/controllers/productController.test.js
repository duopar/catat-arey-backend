const {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  createProductLog,
} = require('../../../controllers/productController');

const { createMockResponse } = require('../utils/jestMocks');

jest.mock('../../../config/firestore', () => ({
  collection: jest.fn().mockReturnThis(),
  where: jest.fn().mockReturnThis(),
  doc: jest.fn().mockReturnThis(),
  add: jest.fn(),
  get: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
}));

const db = require('../../../config/firestore');

let mockResponse;

beforeEach(() => {
  mockResponse = createMockResponse();
});

describe('Validate getAllProducts controller', () => {
  it('Fail to retrieve all products when there are no products and return 404.', async () => {
    const mockRequest = {};

    db.get.mockResolvedValueOnce({
      empty: true,
    });

    await getAllProducts(mockRequest, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(404);
    expect(mockResponse.json).toHaveBeenCalledWith({
      status: 'error',
      message: 'No products found.',
      data: null,
    });
  });

  it('Fail to retrieve all products when server encounters an error and return 500.', async () => {
    const mockRequest = {};

    db.get.mockRejectedValueOnce(new Error('Database query failed.'));

    await getAllProducts(mockRequest, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      status: 'error',
      message: 'Failed to retrieve all products due to server error.',
      data: null,
    });
  });

  it('Successfully retrieve all products and return 200.', async () => {
    const mockRequest = {};

    db.get.mockResolvedValueOnce({
      empty: false,
      forEach: (callback) => {
        const docs = [
          {
            id: 'productId-001',
            data: () => ({
              someProperty: 'some-value',
            }),
          },
          {
            id: 'productId-002',
            data: () => ({
              someProperty: 'some-value',
            }),
          },
        ];

        for (const doc of docs) {
          callback(doc);
        }
      },
    });

    await getAllProducts(mockRequest, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith({
      status: 'success',
      message: 'All product retrieved successfully.',
      data: [
        {
          productId: 'productId-001',
          someProperty: 'some-value',
        },
        {
          productId: 'productId-002',
          someProperty: 'some-value',
        },
      ],
    });
  });
});

describe('Validate getProductById controller', () => {
  let mockRequest;

  beforeEach(() => {
    mockRequest = {
      params: {
        productId: 'productId-001',
      },
      productSnapshot: {
        data: () => ({
          someProperty: 'some-value',
        }),
      },
    };
  });

  it('Fail to retrieve the product by ID when server encounters an error and return 500.', async () => {
    db.get.mockRejectedValueOnce(new Error('Database query failed.'));

    await getProductById(mockRequest, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      status: 'error',
      message: 'Failed to retrieve the product due to server error.',
      data: null,
    });
  });

  it('Successfully retrieve the product by ID and return 200.', async () => {
    const mockinventoryLogSnapshots = [
      {
        empty: true,
      },
      {
        empty: false,
        forEach: (callback) => {
          const docs = [
            {
              id: 'logId-001',
              data: () => ({
                changeType: 'stockIn',
                stockChange: 5,
              }),
            },
            {
              id: 'logId-002',
              data: () => ({
                changeType: 'stockOut',
                stockChange: -10,
              }),
            },
          ];

          docs.forEach(callback);
        },
      },
    ];

    const mockData = [
      {
        someProperty: 'some-value',
        stockInToday: 0,
        stockOutToday: 0,
      },
      {
        someProperty: 'some-value',
        stockInToday: 5,
        stockOutToday: 10,
      },
    ];

    for (let i = 0; i < mockinventoryLogSnapshots.length; i++) {
      jest.clearAllMocks();

      db.get.mockResolvedValueOnce(mockinventoryLogSnapshots[i]);

      await getProductById(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'success',
        message: 'Product retrieved successfully.',
        data: mockData[i],
      });
    }
  });
});

describe('Validate createProduct', () => {
  let mockRequest;

  beforeEach(() => {
    mockRequest = {
      body: {
        name: 'sugar',
        category: 'grocery',
        price: 5000,
        stockLevel: 10,
        restockThreshold: 2,
      },
    };
  });

  it('Fail to create product when server encounters an error and return 500.', async () => {
    db.add.mockRejectedValueOnce(new Error('Database query failed.'));

    await createProduct(mockRequest, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      status: 'error',
      message: 'Failed to create product due to server error.',
      data: null,
    });
  });

  it('Successfully create product and return 201.', async () => {
    db.add.mockResolvedValueOnce({
      id: 'productId-001',
    });

    await createProduct(mockRequest, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(201);
    expect(mockResponse.json).toHaveBeenCalledWith({
      status: 'success',
      message: 'Product created successfully.',
      data: {
        productId: 'productId-001',
      },
    });
  });
});

describe('Validate updateProduct controller', () => {
  let mockRequest;

  beforeEach(() => {
    mockRequest = {
      params: {
        productId: 'productId-001',
      },
    };
  });

  it('Fail to update product when server encounters an error and return 500.', async () => {
    db.update.mockRejectedValueOnce(new Error('Database query failed.'));

    await updateProduct(mockRequest, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      status: 'error',
      message: 'Failed to update product due to server error.',
      data: null,
    });
  });

  it('Successfully update product and return 200.', async () => {
    await updateProduct(mockRequest, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith({
      status: 'success',
      message: 'Product updated successfully.',
      data: {
        productId: 'productId-001',
      },
    });
  });
});

describe('Validate deleteProduct controller', () => {
  let mockRequest;

  beforeEach(() => {
    mockRequest = {
      params: {
        productId: 'productId-001',
      },
    };
  });

  it('Fail to delete product when server encounters an error and return 500.', async () => {
    db.delete.mockRejectedValueOnce(new Error('Database query failed.'));

    await deleteProduct(mockRequest, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      status: 'error',
      message: 'Failed to delete product due to server error.',
      data: null,
    });
  });

  it('Successfully delete product and return 200.', async () => {
    await deleteProduct(mockRequest, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith({
      status: 'success',
      message: 'Product deleted successfully.',
      data: null,
    });
  });
});
