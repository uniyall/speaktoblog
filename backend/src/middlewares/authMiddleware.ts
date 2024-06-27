import { createMiddleware } from "hono/factory";
import { decode, sign, verify } from "hono/jwt";

export default createMiddleware(async (c, next) => {
  const tokenString = c.req.header("Authorization")!;
  const token = tokenString?.split(" ")[1];
  try {
    const verifivationResult = await verify(token, c.env.JWT_SECRET);
    const { id } = verifivationResult;
    c.set("jwtPayload", id);
    return await next();
  } catch (e) {
    c.status(403);
    return c.json({
      mssg: "User not authorized",
    });
  }
});
