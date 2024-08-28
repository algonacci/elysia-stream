import { Elysia, t } from "elysia";
import { Stream } from "@elysiajs/stream";
import { OpenAI } from "openai";
import cors from "@elysiajs/cors";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const app = new Elysia()
  .use(cors())
  .get(
    "/",
    () =>
      new Stream(async (stream) => {
        stream.send("hello");

        await stream.wait(1000);
        stream.send("world");

        stream.close();
      })
  )
  .post(
    "/ai",
    ({ body }) => {
      const { prompt } = body;
      return new Stream(
        openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          stream: true,
          messages: [
            { role: "system", content: "You are a helpful assistant." },
            { role: "user", content: `Return dalam bentuk Markdown ${prompt}` },
          ],
        })
      );
    },
    {
      body: t.Object({
        prompt: t.String(),
      }),
    }
  )
  .listen(3000);

console.log(
  `🦊 Elysia is running at http://${app.server?.hostname}:${app.server?.port}`
);
