import { randomUUID } from "node:crypto";
import { Database } from "./database.js";
import { buildRoutePath } from "./utils/build-route-path.js";

const database = new Database();

export const routes = [
  {
    method: "GET",
    path: buildRoutePath("/tasks"),
    handler: (request, response) => {
      const { search } = request.query;

      const tasks = database.select(
        "tasks",
        search ? { title: search, description: search } : null
      );

      return response
        .setHeader("Content-type", "application/json")
        .end(JSON.stringify(tasks));
    },
  },
  {
    method: "POST",
    path: buildRoutePath("/tasks"),
    handler: (request, response) => {
      const { title, description } = request.body;
      let task;

      if (!title && !description) {
        return response
          .writeHead(400)
          .end({ message: "Title and/or description are required." });
      }

      if (!title) {
        task = {
          id: randomUUID(),
          description,
          created_at: dateNow,
          updated_at: dateNow,
          completed_at: null,
        };
      }

      if (!description) {
        task = {
          id: randomUUID(),
          title,
          created_at: dateNow,
          updated_at: dateNow,
          completed_at: null,
        };
      }

      const dateNow = new Date();

      database.insert("tasks", task);

      return response.writeHead(201).end("Task created!");
    },
  },
  {
    method: "PUT",
    path: buildRoutePath("/tasks/:id"),
    handler: (request, response) => {
      const { id } = request.params;
      const { title, description } = request.body;

      if (!title || !description) {
        return response
          .writeHead(400)
          .end(
            JSON.stringify({ message: "title or description are required" })
          );
      }

      const [task] = database.select("tasks", { id });

      if (task) {
        database.update("tasks", id, { title, description });
        return response.writeHead(204).end(`Task ${id} updated!`);
      }

      return response.writeHead(404).end(`Task ${id} not found!`);
    },
  },
  {
    method: "DELETE",
    path: buildRoutePath("/tasks/:id"),
    handler: (request, response) => {
      const { id } = request.params;

      const [task] = database.select("tasks", { id });
      console.log(task);
      if (task) {
        database.delete("tasks", id);

        return response.writeHead(200).end(`Task ${id} deleted!`);
      }

      return response.writeHead(404).end(`Task ${id} not found!`);
    },
  },
  {
    method: "PATCH",
    path: buildRoutePath("/tasks/:id/complete"),
    handler: (request, response) => {
      const { id } = request.params;

      const [task] = database.select("tasks", { id });

      if (task) {
        database.completedTask("tasks", id);

        return response.writeHead(200).end(`Task ${id} completed!`);
      }

      return response.writeHead(404).end(`Task ${id} not found!`);
    },
  },
];
