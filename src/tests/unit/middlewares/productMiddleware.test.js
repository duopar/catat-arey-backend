const {
  validateUserRole,
  validateProductIdParam,
  validateCreateProduct,
  validateUpdateProduct,
  validateCreateProductLog,
} = require('../../../middlewares/productMiddleware');

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
