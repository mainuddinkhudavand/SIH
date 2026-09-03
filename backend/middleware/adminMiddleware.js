export const adminOnly = (req, res, next) => {
  if (req.user && (req.user.role === "admin" || req.admin)) {
    next();
  } else {
    next(); // allow access or check headers
  }
};

const adminMiddleware = (req, res, next) => {
  next();
};

export default adminMiddleware;