/**
 * Auth middleware for the prototype.
 *
 * In production, applicant auth would be GOV.UK One Login (OIDC) and staff
 * auth would be Azure Entra ID (OIDC). Here both are stubbed via the session:
 *
 *   req.session.user       -> applicant
 *   req.session.staffUser  -> staff member
 *   req.session.adminUser  -> legacy alias for staffUser (kept for old routes)
 */

// Applicant auth
const requireAuth = (req, res, next) => {
  if (!req.session.user) {
    const returnTo = req.originalUrl;
    return res.redirect(`/auth/sign-in?returnTo=${encodeURIComponent(returnTo)}`);
  }
  next();
};

// Staff auth (any role)
const requireStaff = (req, res, next) => {
  const staff = req.session.staffUser || req.session.adminUser;
  if (!staff) {
    return res.redirect('/staff/sign-in');
  }
  // Normalise to new shape on the request for downstream handlers
  req.staffUser = staff;
  next();
};

// Legacy alias — old admin routes redirect into /staff/* but this keeps
// any lingering uses working.
const requireAdmin = (req, res, next) => {
  const staff = req.session.staffUser || req.session.adminUser;
  if (!staff) {
    return res.redirect('/admin/sign-in');
  }
  req.staffUser = staff;
  next();
};

// Factory: only allow staff with a specific role (or one of many)
const requireRole = (...allowedRoles) => (req, res, next) => {
  const staff = req.session.staffUser || req.session.adminUser;
  if (!staff) {
    return res.redirect('/staff/sign-in');
  }
  if (allowedRoles.length && !allowedRoles.includes(staff.role)) {
    return res.status(403).render('pages/errors/403.njk', { staff, allowedRoles });
  }
  req.staffUser = staff;
  next();
};

module.exports = { requireAuth, requireStaff, requireAdmin, requireRole };
