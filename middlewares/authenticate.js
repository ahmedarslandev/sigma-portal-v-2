import jwt from "jsonwebtoken";

export const isUserAuthenticated = async (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.redirect("/sign-in");
  }
  const isAuthenticated = await jwt.sign(token, process.env.JWT_TOKEN_SECRET);

  if (isAuthenticated) {
    return next();
  } else {
    return res.redirect("/sign-in");
  }
};
