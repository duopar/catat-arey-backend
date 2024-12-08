const {
  validateUserRole,
  validateProductIdParam,
  validateCreateProduct,
  validateUpdateProduct,
  validateCreateProductLog,
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
      decodedUserToken: {
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
      decodedUserToken: {
        role: 'owner',
      },
    };

    validateUserRole(mockRequest, mockResponse, mockNext);

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
