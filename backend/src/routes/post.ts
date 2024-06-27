import { Hono } from "hono";
import authMiddleware from "../middlewares/authMiddleware";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { CreatePostInput, UpdatePostInput } from "@prateekuniyal/common-auth";

export const postRouter = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
  };
}>();

postRouter.use(authMiddleware);

postRouter.post("/", async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  const id = c.get("jwtPayload");
  const { content, title } = await c.req.json();

  const { success } = CreatePostInput.safeParse({
    content,
    title,
  });

  if (!success) {
    c.status(401);
    return c.json({
      mssg: "Invalid Inputs",
    });
  }

  try {
    const res = await prisma.post.create({
      data: {
        content,
        title,
        published: true,
        authorId: id,
      },
    });

    c.status(200);

    return c.json({
      mssg: "Blog submitted!",
    });
  } catch (e) {
    console.log(e);
    c.status(500);
    c.json({
      mssg: "Some error happened while posting blog!",
    });
  }
});

postRouter.put("/", async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  const id = c.get("jwtPayload");
  const body = await c.req.json();

  const { success } = UpdatePostInput.safeParse({
    content: body.content,
    title: body.title,
  });

  if (!success) {
    c.status(401);
    return c.json({
      mssg: "Invalid Inputs",
    });
  }

  try {
    await prisma.post.update({
      data: {
        content: body.content,
        title: body.title,
        published: body.published,
      },
      where: {
        id: body.id,
      },
    });
    c.status(200);
    return c.json({
      mssg: "Post updated",
    });
  } catch (e) {
    console.log(e);
    c.status(500);
    return c.json({
      mssg: "Somwthing went wrong!",
    });
  }
});

postRouter.get("/bulk", async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  const id = c.get("jwtPayload");
  console.log(id);

  try {
    const res = await prisma.post.findMany();

    if (!res) {
      c.status(404);
      return c.json({
        mssg: "No Posts found",
      });
    }

    c.status(200);
    return c.json(res);
  } catch (e) {
    return c.json({
      mssg: "Some error occured!",
    });
  }
});

postRouter.get("/:id", async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  const postId = c.req.param("id");

  const id = c.get("jwtPayload");

  try {
    const res = await prisma.post.findUnique({
      where: {
        id: postId,
      },
      include: {
        author: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!res) {
      c.status(404);
      return c.json({
        mssg: "No post found",
      });
    }

    c.status(200);

    return c.json(res);
  } catch (e) {
    console.log(e);
    c.status(500);

    return c.json({
      mssg: "Something went wrong!",
    });
  }
});
