jest.mock('bcrypt', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

jest.mock('../../../config/firestore', () => ({
  collection: jest.fn().mockReturnThis(),
  where: jest.fn().mockReturnThis(),
  get: jest.fn(),
  add: jest.fn(),
}));

const bcrypt = require('bcrypt');
const db = require('../../../config/firestore');

const {
  createMockRequest,
  createMockResponse,
  createMockNext,
} = require('../utils/helper');

const {
  validateUserRegistration,
  validateUserLogin,
} = require('../../../middlewares/userValidationMiddleware');

describe('Validate user registration middleware', () => {
  let mockRequest;
  let mockResponse;
  let mockNext;

  beforeEach(() => {
    console.log('bjir');
    mockRequest = createMockRequest({
      username: 'testUser',
      password: 'Tes@1234',
      confirmPassword: 'Tes@1234',
      role: 'owner',
    });
    mockResponse = createMockResponse();
    mockNext = createMockNext();
  });

  it('Reject registration if any property is empty and return 400.', async () => {
    mockRequest = createMockRequest({
      username: '',
      password: 'Tes@1234',
      confirmPassword: 'Tes@1234',
      role: 'owner',
    });

    await validateUserRegistration(mockRequest, mockResponse, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      status: 'error',
      message: expect.any(String),
      data: null,
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('Reject registration if username already exists and return 409.', async () => {
    db.get.mockResolvedValueOnce({
      empty: false,
    });

    await validateUserRegistration(mockRequest, mockResponse, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(409);
    expect(mockResponse.json).toHaveBeenCalledWith({
      status: 'error',
      message: expect.any(String),
      data: null,
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('Reject registration if server error and return 500.', async () => {
    db.get.mockRejectedValueOnce(new Error('Database query failed.'));

    await validateUserRegistration(mockRequest, mockResponse, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      status: 'error',
      message: expect.any(String),
      data: null,
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('Allow registration if all conditions are met and return 200.', async () => {
    db.get.mockResolvedValueOnce({
      empty: true,
    });

    await validateUserRegistration(mockRequest, mockResponse, mockNext);

    expect(mockResponse.status).not.toHaveBeenCalled();
    expect(mockResponse.json).not.toHaveBeenCalled();
    expect(mockNext).toHaveBeenCalled();
  });
});
