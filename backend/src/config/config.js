require('dotenv').config();

module.exports = {
  app: {
    port: process.env.PORT || 5000,
    env: 'development',
    jwtSecret: process.env.JWT_SECRET,
    jwtExpiresIn: '24h'
  },
  mongodb: {
    uri: process.env.MONGODB_URI
  },
  blockchain: {
    restApi: process.env.SAWTOOTH_REST_API || 'http://localhost:8008'
  }
}; 