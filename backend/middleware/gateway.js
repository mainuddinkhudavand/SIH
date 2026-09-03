// API Gateway & Middleware Layer: Data Standards, Response Headers, Reusable Connectors

export const responseHandler = (req, res, next) => {
  res.setHeader("X-API-Gateway", "E-Gram-v2.0");
  res.setHeader("X-Gateway-Timestamp", new Date().toISOString());
  next();
};

export const dataStandardizer = (schemaType) => {
  return (req, res, next) => {
    req.schemaVersion = "2.0";
    req.gatewayTimestamp = new Date();
    next();
  };
};

export default {
  responseHandler,
  dataStandardizer
};
