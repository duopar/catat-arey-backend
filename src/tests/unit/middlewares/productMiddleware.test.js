const {
  validateUserRole,
  validateProductQueryParam,
  validateProductIdParam,
  validateCreateOrUpdateProduct,
  //validateCreateProductLog,
} = require('../../../middlewares/productMiddleware');

jest.mock('../../../config/firestore', () => ({
  collection: jest.fn().mockReturnThis(),
  doc: jest.fn().mockReturnThis(),
  where: jest.fn().mockReturnThis(),
  get: jest.fn(),
}));

const db = require('../../../config/firestore');

const { createMockResponse, createMockNext } = require('../utils/jestMocks');

let mockResponse;
let mockNext;

beforeEach(() => {
  mockResponse = createMockResponse();
  mockNext = createMockNext();
});

describe('Validate user role middleware', () => {
  it('Reject request when role is not "owner" and return 401.', () => {
    const mockRequest = {
      decodedUserAccessToken: {
        role: 'employee',
      },
    };

    validateUserRole(mockRequest, mockResponse, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      status: 'error',
      message:
        'Only users with the "owner" role are authorized to add, update, or delete products.',
      data: null,
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('Allow request when role is "owner".', () => {
    const mockRequest = {
      decodedUserAccessToken: {
        role: 'owner',
      },
    };

    validateUserRole(mockRequest, mockResponse, mockNext);

    expect(mockResponse.status).not.toHaveBeenCalled();
    expect(mockResponse.json).not.toHaveBeenCalled();
    expect(mockNext).toHaveBeenCalled();
  });
});

describe('Validate product query parameters middleware', () => {
  it('Reject request when query parameters is invalid and return 400.', () => {
    const mockRequest = {
      query: {
        someInvalidKey: 'some-invalid-value',
      },
    };

    validateProductQueryParam(mockRequest, mockResponse, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      status: 'error',
      message: `Invalid query parameter: "${Object.keys(mockRequest.query)[0]}".`,
      data: null,
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('Allow request when query parameter is valid.', () => {
    const mockRequest = {
      query: {
        name: 'some-product-name',
      },
    };

    validateProductQueryParam(mockRequest, mockResponse, mockNext);

    expect(mockResponse.status).not.toHaveBeenCalled();
    expect(mockResponse.json).not.toHaveBeenCalled();
    expect(mockNext).toHaveBeenCalled();
  });
});

describe('Validate product id parameter middleware', () => {
  it('Reject request when productId is not found and return 404.', async () => {
    const mockRequest = {
      params: {
        productId: 'non-existent-productId',
      },
    };

    db.get.mockResolvedValueOnce({
      exists: false,
    });

    await validateProductIdParam(mockRequest, mockResponse, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(404);
    expect(mockResponse.json).toHaveBeenCalledWith({
      status: 'error',
      message: 'No product found with the provided ID.',
      data: null,
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('Allow request when productId exists.', async () => {
    const mockRequest = {
      params: {
        productId: 'my-productId',
      },
    };

    db.get.mockResolvedValueOnce({
      exists: true,
    });

    await validateProductIdParam(mockRequest, mockResponse, mockNext);

    expect(mockResponse.status).not.toHaveBeenCalled();
    expect(mockResponse.json).not.toHaveBeenCalled();
    expect(mockNext).toHaveBeenCalled();
  });
});

describe('Validate create or update product middleware', () => {
  it('Reject request when any property is empty and return 400.', async () => {
    const mockRequests = [
      {
        params: {},
        body: {
          category: 'grocery',
          price: 5000,
          stockLevel: 10,
          restockThreshold: 2,
        },
      },
      {
        params: {},
        body: {
          name: 'sugar',
          price: 5000,
          stockLevel: 10,
          restockThreshold: 2,
        },
      },
      {
        params: {},
        body: {
          name: 'sugar',
          category: 'grocery',
          stockLevel: 10,
          restockThreshold: 2,
        },
      },
      {
        params: {},
        body: {
          name: 'sugar',
          category: 'grocery',
          price: 5000,
          restockThreshold: 2,
        },
      },
      {
        params: {},
        body: {
          name: 'sugar',
          category: 'grocery',
          price: 5000,
          stockLevel: 10,
        },
      },
    ];

    const validProperties = [
      'name',
      'category',
      'price',
      'stockLevel',
      'restockThreshold',
    ];

    let validPropertiesIndex = 0;

    for (const mockRequest of mockRequests) {
      jest.clearAllMocks();

      await validateCreateOrUpdateProduct(mockRequest, mockResponse, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'error',
        message: `"${validProperties[validPropertiesIndex++]}" is required`,
        data: null,
      });
      expect(mockNext).not.toHaveBeenCalled();
    }
  });

  it('Reject request when product name already exists and return 409.', async () => {
    const mockRequests = [
      // request for creating product
      {
        params: {},
        body: {
          name: 'existing-product',
          category: 'grocery',
          price: 5000,
          stockLevel: 10,
          restockThreshold: 2,
        },
      },
      // request for updating product
      {
        params: {
          productId: 'my-productId',
        },
        body: {
          name: 'existing-product',
          category: 'grocery',
          price: 5000,
          stockLevel: 10,
          restockThreshold: 2,
        },
      },
    ];

    for (const mockRequest of mockRequests) {
      jest.clearAllMocks();

      db.get.mockResolvedValueOnce({
        empty: false,
      });

      await validateCreateOrUpdateProduct(mockRequest, mockResponse, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(409);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Product already exists.',
        data: null,
      });
      expect(mockNext).not.toHaveBeenCalled;
    }
  });

  it('Allow request when all conditions are met.', async () => {
    const mockRequests = [
      // request for creating product
      {
        params: {},
        body: {
          name: 'sugar',
          category: 'grocery',
          price: 5000,
          stockLevel: 10,
          restockThreshold: 2,
        },
      },
      // request for updating product
      {
        params: {
          productId: 'my-productId',
        },
        body: {
          category: 'grocery',
        },
      },
    ];

    for (const mockRequest of mockRequests) {
      jest.clearAllMocks();

      db.get.mockResolvedValueOnce({
        empty: true,
      });

      await validateCreateOrUpdateProduct(mockRequest, mockResponse, mockNext);

      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.json).not.toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalled();
    }
  });
});

//describe('Validate create product log middleware', () => {
//  it('Reject request when any property is empty and return 400.', () => {
//    const mockRequests = [
//      {
//        productSnapshot: {
//          data: () => ({
//            stockLevel: 5,
//          }),
//        },
//        body: {
//          stockOut: 2,
//        },
//      },
//      {
//        productSnapshot: {
//          data: () => ({
//            stockLevel: 5,
//          }),
//        },
//        body: {
//          stockIn: 2,
//        },
//      },
//    ];
//
//    const validProperties = ['stockIn', 'stockOut'];
//
//    let validPropertiesIndex = 0;
//
//    for (const mockRequest of mockRequests) {
//      jest.clearAllMocks();
//
//      validateCreateProductLog(mockRequest, mockResponse, mockNext);
//
//      expect(mockResponse.status).toHaveBeenCalledWith(400);
//      expect(mockResponse.json).toHaveBeenCalledWith({
//        status: 'error',
//        message: `"${validProperties[validPropertiesIndex++]}" is required`,
//        data: null,
//      });
//      expect(mockNext).not.toHaveBeenCalled();
//    }
//  });
//
//  it('Reject request when stockOut exceeds current stockLevel and return 400.', () => {
//    const mockRequest = {
//      productSnapshot: {
//        data: () => ({
//          stockLevel: 5,
//        }),
//      },
//      body: {
//        stockIn: 0,
//        stockOut: 10,
//      },
//    };
//
//    validateCreateProductLog(mockRequest, mockResponse, mockNext);
//
//    expect(mockResponse.status).toHaveBeenCalledWith(400);
//    expect(mockResponse.json).toHaveBeenCalledWith({
//      status: 'error',
//      message:
//        '"stockOut" must be less than or equal to the current product\'s "stockLevel".',
//      data: null,
//    });
//    expect(mockNext).not.toHaveBeenCalled();
//  });
//
//  it('Reject request when both stockIn and stockOut are 0 and return 400.', () => {
//    const mockRequest = {
//      productSnapshot: {
//        data: () => ({
//          stockLevel: 5,
//        }),
//      },
//      body: {
//        stockIn: 0,
//        stockOut: 0,
//      },
//    };
//
//    validateCreateProductLog(mockRequest, mockResponse, mockNext);
//
//    expect(mockResponse.status).toHaveBeenCalledWith(400);
//    expect(mockResponse.json).toHaveBeenCalledWith({
//      status: 'error',
//      message: '"stockIn" and "stockOut" cannot both be 0 at the same time.',
//      data: null,
//    });
//    expect(mockNext).not.toHaveBeenCalled();
//  });
//
//  it('Allow request when all conditions are met.', () => {
//    const mockRequest = {
//      productSnapshot: {
//        data: () => ({
//          stockLevel: 5,
//        }),
//      },
//      body: {
//        stockIn: 0,
//        stockOut: 2,
//      },
//    };
//
//    validateCreateProductLog(mockRequest, mockResponse, mockNext);
//
//    expect(mockResponse.status).not.toHaveBeenCalled();
//    expect(mockResponse.json).not.toHaveBeenCalled();
//    expect(mockNext).toHaveBeenCalled();
//  });
//});
