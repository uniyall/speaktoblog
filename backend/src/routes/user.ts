import { Hono } from "hono";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { sign } from "hono/jwt";
import { UserSigninInput, UserSignupInput } from "@prateekuniyal/common-auth";

export const userRouter = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
  };
}>();

userRouter.post("/signup", async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  const { email, password, name } = await c.req.json();

  console.log("dkfjdfn");
  const { success } = UserSignupInput.safeParse({
    email,
    password,
    name,
  });

  if (!success) {
    c.status(401);
    return c.json({
      mssg: "Invalid Inputs",
    });
  }

  // Password Hashing
  const data = new TextEncoder().encode(password);
  const hash = await crypto.subtle.digest({ name: "SHA-256" }, data);
  const hexString = [...new Uint8Array(hash)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  try {
    const res = await prisma.user.create({
      data: {
        email,
        password: hexString,
        name,
      },
    });

    const token = await sign(
      {
        id: res.id,
      },
      c.env.JWT_SECRET
    );

    c.status(200);
    return c.json({
      token,
    });
  } catch (e) {
    console.log(e);
    c.status(411);
    return c.json({
      mssg: "invalid, pls try again",
    });
  }
});

userRouter.post("/signin", async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  const { email, password } = await c.req.json();

  const { success } = UserSigninInput.safeParse({
    email,
    password,
  });

  if (!success) {
    c.status(401);
    return c.json({
      mssg: "Invalid Inputs",
    });
  }

  // Password Hashing
  const data = new TextEncoder().encode(password);
  const hash = await crypto.subtle.digest({ name: "SHA-256" }, data);
  const hexString = [...new Uint8Array(hash)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  try {
    const res = await prisma.user.findUniqueOrThrow({
      where: {
        email: email,
      },
    });

    if (res.password !== hexString) {
      c.status(403);
      return c.json({
        mssg: "Wrong Password!",
      });
    }

    const token = await sign(
      {
        id: res.id,
      },
      c.env.JWT_SECRET
    );

    c.status(200);

    return c.json({
      token: token,
    });
  } catch (e) {
    console.log(e);
    return c.json({
      mssg: "Something went wrong!",
    });
  }
});
