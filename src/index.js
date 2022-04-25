const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find((user) => user.username === username);
  if(!user) {
    return response.status(400).json({error: "User not found!"})
  };

  request.user = user;

  return next();
}

app.post('/users', (request, response) => {
  const { name, username} = request.body;

  const userAlreadyExists = users.some((user) => user.username == username);

  if(userAlreadyExists) {
    return response.status(400).json({ error: "User already exists!"})
  };

  users.push({
    id: uuidv4(),
    name,
    username,
    todos: []
  });

  return response.status(201).json({ success: "User created!"});

});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { username } = request.headers;

  const user = users.find((user) => user.username === username);

  return response.json(user);

});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { username } = request.headers;
  const { title, deadline } = request.body;

  const newTodo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  const user = users.find((user) => user.username === username);
  user.todos.push(newTodo);

  return response.status(201).json({success: "Success"});
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { username } = request.headers;
  const { id } = request.params;
  const { title, deadline } = request.body;

  const user = users.find((user) => user.username === username);

  const todoToAlter = user.todos.filter((todo) => todo.id == id);

  if(todoToAlter) {
    if(!deadline) {
      todoToAlter[0].title = title
      return response.status(200).json({success: "Title updated"})
    };
  
    if(!title) {
      todoToAlter[0].deadline = new Date(deadline)
      return response.status(200).json({success: "Deadline updated"})
    };
  
    todoToAlter[0].title = title;
    todoToAlter[0].deadline = new Date(deadline);
  
    return response.status(200).json({success: "Todo updated"})
  }

});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  // Complete aqui
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  // Complete aqui
});

module.exports = app;