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
  validateUserRegistration,
  validateUserLogin,
} = require('../../../middlewares/userValidationMiddleware');

describe('Validate user registration', () => {
  it('Reject registration if any property is empty.', async () => {
    const mockRequest = {
      body: {
        username: '',
        password: 'Tes@1234',
        confirmPassword: 'Tes@1234',
        role: 'owner',
      },
    };

    const mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const mockNext = jest.fn();

    await validateUserRegistration(mockRequest, mockResponse, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      status: 'error',
      message: expect.any(String),
      data: null,
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('Reject registration if username already exists.', async () => {
    const mockRequest = {
      body: {
        username: 'testUser',
        password: 'Tes@1234',
        confirmPassword: 'Tes@1234',
        role: 'owner',
      },
    };

    const mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const mockNext = jest.fn();

    db.get.mockResolvedValueOnce({
      empty: false,
      docs: [],
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

  it('Reject registration if server error.', async () => {
    const mockRequest = {
      body: {
        username: 'testUser',
        password: 'Tes@1234',
        confirmPassword: 'Tes@1234',
        role: 'owner',
      },
    };

    const mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const mockNext = jest.fn();

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

  it('Allow registration if all conditions are met.', async () => {
    const mockRequest = {
      body: {
        username: 'testUser',
        password: 'Tes@1234',
        confirmPassword: 'Tes@1234',
        role: 'owner',
      },
    };

    const mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const mockNext = jest.fn();

    db.get.mockResolvedValueOnce({
      empty: true,
      docs: [],
    });

    await validateUserRegistration(mockRequest, mockResponse, mockNext);

    expect(mockResponse.status).not.toHaveBeenCalled();
    expect(mockNext).toHaveBeenCalled();
  });
});

describe('', () => {
  it('', () => {});

  it('', () => {});
});
