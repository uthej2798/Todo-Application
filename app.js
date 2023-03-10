const express = require("express");
const path = require("path");

const app = express();
app.use(express.json());

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const dbPath = path.join(__dirname, "todoApplication.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("server running");
    });
  } catch (e) {
    console.log(`dbError: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

// API - 1

app.get("/todos/", async (request, response) => {
  let data = null;
  let getTodosQuery = "";
  const { search_q = "", priority, status } = request.query;

  const hasPriorityAndStatusProperties = (requestQuery) => {
    return (
      requestQuery.priority !== undefined && requestQuery.status !== undefined
    );
  };

  const hasPriorityProperty = (requestQuery) => {
    return requestQuery.priority !== undefined;
  };

  const hasStatusProperty = (requestQuery) => {
    return requestQuery.status !== undefined;
  };

  switch (true) {
    case hasPriorityAndStatusProperties(request.query):
      getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%'
    AND status = '${status}'
    AND priority = '${priority}';`;
      break;
    case hasPriorityProperty(request.query):
      getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%'
    AND priority = '${priority}';`;
      break;
    case hasStatusProperty(request.query):
      getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%'
    AND status = '${status}';`;
      break;
    default:
      getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%';`;
  }

  data = await db.all(getTodosQuery);
  response.send(data);
});

// API - 2
// GET TODO BY ID

app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  console.log(todoId);
  const getTodo = `
    SELECT
      *
    FROM
      todo
    WHERE 
      id = ${todoId}`;
  const todo = await db.get(getTodo);
  console.log(todo);

  response.send(todo);
});

// CREATE TODO API - 3

app.post("/todos/", async (request, response) => {
  const getTodo = request.body;
  console.log(getTodo);
  const { todo, priority, status } = getTodo;
  const createTodo = `
        INSERT INTO
            todo(todo,priority,status)
        VALUES
        (
            '${todo}',
             '${priority}',
             '${status}'
        );`;

  const createdTodo = await db.run(createTodo);
  const todoId = createdTodo.lastID;
  console.log(todoId);
  response.send("Todo Successfully Added");
});

// API - 4

app.put("/todos/:todoId/", async (request, response) => {
  let data = null;
  let getTodosQuery = "";
  const { todo, priority, status } = request.body;
  const { todoId } = request.params;

  const hasTodoRequest = (requestBody) => {
    return requestBody.todo !== undefined;
  };

  const hasPriorityRequest = (requestBody) => {
    return requestBody.priority !== undefined;
  };

  const hasStatusRequest = (requestBody) => {
    return requestBody.status !== undefined;
  };

  switch (true) {
    case hasTodoRequest(request.body):
      getTodosQuery = `
            UPDATE
                todo
            SET
                todo = '${todo}'
            WHERE
                id = ${todoId}`;
      data = await db.run(getTodosQuery);
      response.send("Todo Updated");
      break;
    case hasPriorityRequest(request.body):
      getTodosQuery = `
            UPDATE
                todo
            SET
                priority = '${priority}'
            WHERE
                id = ${todoId}`;
      data = await db.run(getTodosQuery);
      response.send("Priority Updated");
      break;
    case hasStatusRequest(request.body):
      getTodosQuery = `
            UPDATE
                todo
            SET
                status = '${status}'
            WHERE
                id = ${todoId}`;
      data = await db.run(getTodosQuery);
      response.send("Status Updated");
      break;
  }
});

// DELETE TODO

app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const deleteTodo = `
        DELETE FROM
        todo
        where
        id = ${todoId};`;
  await db.run(deleteTodo);
  response.send("Todo Deleted");
});

module.exports = app;
