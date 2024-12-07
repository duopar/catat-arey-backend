const {
  createMockRequest,
  createMockResponse,
  createMockNext,
} = require('../utils/jestMocks');

const {
  validateUserRegistration,
  validateUserLogin,
} = require('../../../middlewares/userValidationMiddleware');

jest.mock('bcrypt');
jest.mock('../../../config/firestore', () => ({
  collection: jest.fn().mockReturnThis(),
  where: jest.fn().mockReturnThis(),
  get: jest.fn(),
}));

const bcrypt = require('bcrypt');
const db = require('../../../config/firestore');

describe('Validate user registration middleware', () => {
  let mockRequest;
  let mockResponse;
  let mockNext;

  beforeEach(() => {
    mockRequest = createMockRequest({
      username: 'testUser',
      password: 'Tes@1234',
      confirmPassword: 'Tes@1234',
      role: 'owner',
    });
    mockResponse = createMockResponse();
    mockNext = createMockNext();
  });

  it('Reject registration when any property is empty and return 400.', async () => {
    const mockRequest = createMockRequest({
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

  it('Reject registration when username already exists and return 409.', async () => {
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

  it('Reject registration when server encounters an error and return 500.', async () => {
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

  it('Allow registration when all properties are valid.', async () => {
    db.get.mockResolvedValueOnce({
      empty: true,
    });

    await validateUserRegistration(mockRequest, mockResponse, mockNext);

    expect(mockResponse.status).not.toHaveBeenCalled();
    expect(mockResponse.json).not.toHaveBeenCalled();
    expect(mockNext).toHaveBeenCalled();
  });
});

describe('Validate user login middleware', () => {
  let mockRequest;
  let mockResponse;
  let mockNext;

  beforeEach(() => {
    mockRequest = createMockRequest({
      username: 'testUser',
      password: 'Tes@1234',
    });
    mockResponse = createMockResponse();
    mockNext = createMockNext();
  });

  it('Reject login when any property is empty and return 400.', async () => {
    const mockRequest = createMockRequest({
      username: '',
      password: 'Tes@1234',
    });

    await validateUserLogin(mockRequest, mockResponse, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      status: 'error',
      message: expect.any(String),
      data: null,
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('Reject login when username is not found and return 401.', async () => {
    db.get.mockResolvedValueOnce({
      empty: true,
    });

    await validateUserLogin(mockRequest, mockResponse, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      status: 'error',
      message: expect.any(String),
      data: null,
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('Reject login when password is invalid and return 401.', async () => {
    db.get.mockResolvedValueOnce({
      empty: false,
      docs: [
        {
          data: () => ({
            password: 'Tes@12345',
          }),
        },
      ],
    });

    bcrypt.compare.mockResolvedValueOnce(false);

    await validateUserLogin(mockRequest, mockResponse, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      status: 'error',
      message: expect.any(String),
      data: null,
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('Reject login when server encounters an error and return 500.', async () => {
    db.get.mockRejectedValueOnce(new Error('Database query failed.'));

    await validateUserLogin(mockRequest, mockResponse, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      status: 'error',
      message: expect.any(String),
      data: null,
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('Allow login when all properties are valid.', async () => {
    db.get.mockResolvedValueOnce({
      empty: false,
      docs: [
        {
          data: () => ({
            password: 'Tes@1234',
          }),
        },
      ],
    });

    bcrypt.compare.mockResolvedValueOnce(true);

    await validateUserLogin(mockRequest, mockResponse, mockNext);

    expect(mockResponse.status).not.toHaveBeenCalled();
    expect(mockResponse.json).not.toHaveBeenCalled();
    expect(mockNext).toHaveBeenCalled();
  });
});
