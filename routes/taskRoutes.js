const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const authMiddleware = require('../middleware/auth');
const validateTaskInput = require('../middleware/validateTask');

// Apply JWT Authentication Middleware to ALL task routes
router.use(authMiddleware);

// @route   GET /api/tasks
// @desc    Get all tasks for the logged-in user
// @access  Private
router.get('/', async (req, res) => {
    try {
        const tasks = await Task.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            count: tasks.length,
            tasks
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching tasks',
            error: error.message
        });
    }
});

// @route   POST /api/tasks
// @desc    Create a new task for the logged-in user
// @access  Private (uses validateTaskInput middleware)
router.post('/', validateTaskInput, async (req, res) => {
    try {
        const { title, completed } = req.body;

        const newTask = await Task.create({
            title: title.trim(),
            completed: completed || false,
            user: req.user.id
        });

        res.status(201).json({
            success: true,
            message: 'Task created successfully',
            task: newTask
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error creating task',
            error: error.message
        });
    }
});

// @route   PUT /api/tasks/:id
// @desc    Update task status or title
// @access  Private
router.put('/:id', async (req, res) => {
    try {
        const { title, completed } = req.body;
        const taskId = req.params.id;

        const task = await Task.findOne({ _id: taskId, user: req.user.id });
        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Task not found or unauthorized'
            });
        }

        if (title !== undefined) task.title = title.trim();
        if (completed !== undefined) task.completed = completed;

        await task.save();

        res.status(200).json({
            success: true,
            message: 'Task updated successfully',
            task
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating task',
            error: error.message
        });
    }
});

// @route   DELETE /api/tasks/:id
// @desc    Delete a task
// @access  Private
router.delete('/:id', async (req, res) => {
    try {
        const taskId = req.params.id;

        const task = await Task.findOneAndDelete({ _id: taskId, user: req.user.id });
        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Task not found or unauthorized'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Task deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting task',
            error: error.message
        });
    }
});

module.exports = router;
