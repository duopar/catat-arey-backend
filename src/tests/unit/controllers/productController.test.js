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
  doc: jest.fn().mockReturnThis(),
  get: jest.fn(),
  update: jest.fn(),
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
              someProperties: 'some-value',
            }),
          },
          {
            id: 'productId-002',
            data: () => ({
              someProperties: 'some-value',
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
          someProperties: 'some-value',
        },
        {
          productId: 'productId-002',
          someProperties: 'some-value',
        },
      ],
    });
  });
});
