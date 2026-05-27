const Todo = require('../models/Todo');

// @desc    Get all todos for logged in user
// @route   GET /api/todos
// @access  Private
exports.getTodos = async (req, res, next) => {
  try {
    const todos = await Todo.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json(todos);
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new todo
// @route   POST /api/todos
// @access  Private
exports.createTodo = async (req, res, next) => {
  try {
    const { title, description, priority, dueDate } = req.body;

    if (!title) {
      res.status(400);
      throw new Error('Title is required');
    }

    const todo = await Todo.create({
      user: req.user._id,
      title,
      description,
      priority: priority || 'medium',
      dueDate,
    });

    res.status(201).json(todo);
  } catch (error) {
    next(error);
  }
};

// @desc    Update a todo
// @route   PUT /api/todos/:id
// @access  Private
exports.updateTodo = async (req, res, next) => {
  try {
    const { title, description, completed, priority, dueDate } = req.body;

    const todo = await Todo.findById(req.params.id);

    if (!todo) {
      res.status(404);
      throw new Error('Todo not found');
    }

    // Check if the todo belongs to the logged-in user
    if (todo.user.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error('User not authorized');
    }

    // Update fields
    if (title !== undefined) todo.title = title;
    if (description !== undefined) todo.description = description;
    if (completed !== undefined) todo.completed = completed;
    if (priority !== undefined) todo.priority = priority;
    if (dueDate !== undefined) todo.dueDate = dueDate;

    const updatedTodo = await todo.save();

    res.status(200).json(updatedTodo);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a todo
// @route   DELETE /api/todos/:id
// @access  Private
exports.deleteTodo = async (req, res, next) => {
  try {
    const todo = await Todo.findById(req.params.id);

    if (!todo) {
      res.status(404);
      throw new Error('Todo not found');
    }

    // Check if the todo belongs to the logged-in user
    if (todo.user.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error('User not authorized');
    }

    await Todo.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: 'Todo deleted successfully' });
  } catch (error) {
    next(error);
  }
};
