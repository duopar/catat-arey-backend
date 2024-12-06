const createMockRequest = (body) => ({
  body,
});

const createMockResponse = () => ({
  status: jest.fn().mockReturnThis(),
  json: jest.fn(),
});

const createMockNext = () => jest.fn();

module.exports = {
  createMockRequest,
  createMockResponse,
  createMockNext,
};
