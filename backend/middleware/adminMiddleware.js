exports.admin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(403);
    next(new Error('Not authorized as an admin'));
  }
};
