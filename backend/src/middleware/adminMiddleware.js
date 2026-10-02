const requireAdmin = (
  req,
  res,
  next
) => {
  if (!req.user) {
    res.status(401);

    return next(
      new Error(
        "Authentication is required"
      )
    );
  }


  if (
    req.user.role !==
    "admin"
  ) {
    res.status(403);

    return next(
      new Error(
        "Administrator access is required"
      )
    );
  }


  next();
};


module.exports = {
  requireAdmin,
};