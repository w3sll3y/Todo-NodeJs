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
    return response.status(404).json({error: "User not found!"})
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

  const newUser = {
    id: uuidv4(),
    name,
    username,
    todos: []
  }
  users.push(newUser);

  return response.status(201).json(newUser);

});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { username } = request.headers;

  const user = users.find((user) => user.username === username);

  return response.json(user.todos);

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

  return response.send({error: "Todo not found!"})

});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { username } = request.headers;
  const { id } = request.params;

  const user = users.find((user) => user.username === username);

  const todoToAlter = user.todos.filter((todo) => todo.id == id);

  if(todoToAlter[0].done == false) {
    todoToAlter[0].done = true
    return response.status(200).json(todoToAlter)
  }

  if(todoToAlter[0].done == true) {
    todoToAlter[0].done = false
    return response.status(200).json(todoToAlter)
  }
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { username } = request.headers;
  const { id } = request.params;

  const user = users.find((user) => user.username === username);

  const todoToRemove = user.todos.filter((todo) => todo.id == id);

  if(todoToRemove) {
    user.todos.splice(user.todos.findIndex(function(remove){
      return remove.id === todoToRemove[0].id
    }), 1)
    return response.status(200).json(user.todos)
  } 
  if(!todoToRemove) {
    return response.json({ error: "Todo not found!"})
  }  

});

module.exports = app;