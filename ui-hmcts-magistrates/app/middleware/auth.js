// Middleware to require applicant authentication
const requireAuth = (req, res, next) => {
  if (!req.session.user) {
    const returnTo = req.originalUrl;
    return res.redirect(`/auth/sign-in?returnTo=${encodeURIComponent(returnTo)}`);
  }
  next();
};

// Middleware to require admin authentication
const requireAdmin = (req, res, next) => {
  if (!req.session.adminUser) {
    return res.redirect('/admin/sign-in');
  }
  next();
};

module.exports = { requireAuth, requireAdmin };
