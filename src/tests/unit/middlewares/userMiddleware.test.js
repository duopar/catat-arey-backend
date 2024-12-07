const {
  createMockRequest,
  createMockResponse,
  createMockNext,
} = require('../utils/jestMocks');

const {
  validateUserIdParam,
  validateUserUpdate,
} = require('../../../middlewares/userMiddleware');

jest.mock('../../../config/firestore', () => ({
  collection: jest.fn().mockReturnThis(),
  doc: jest.fn().mockReturnThis(),
  get: jest.fn(),
}));

const db = require('../../../config/firestore');

let mockResponse;
let mockNext;

beforeEach(() => {
  mockResponse = createMockResponse();
  mockNext = createMockNext();
});

describe('Validate user id parameter middleware', () => {
  let mockRequest;

  beforeAll(() => {
    mockRequest = {
      params: {
        userId: 'myid123',
      },
    };
  });

  it('Reject request when userId is not found and return 404.', async () => {
    db.get.mockResolvedValueOnce({
      exists: false,
    });

    await validateUserIdParam(mockRequest, mockResponse, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(404);
    expect(mockResponse.json).toHaveBeenCalledWith({
      status: 'error',
      message: 'No user found with the provided ID.',
      data: null,
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('Allow request when userId exists.', async () => {
    db.get.mockResolvedValueOnce({
      exists: true,
    });

    await validateUserIdParam(mockRequest, mockResponse, mockNext);

    expect(mockResponse.status).not.toHaveBeenCalled();
    expect(mockResponse.json).not.toHaveBeenCalled();
    expect(mockNext).toHaveBeenCalled();
  });
});
