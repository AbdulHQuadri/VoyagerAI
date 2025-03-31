const express = require('express'); 
const router = express.Router(); 

const tasks = [
    { id: 1, title: 'Visiting the Shops', description: 'Buy groceries and household items.' , difficulty: 'Easy'},
    { id: 2, title: 'Walking around Town', description: 'Take a walk around the park and enjoy the weather.' , difficulty: 'Medium'},
    { id: 3, title: 'Meeting with Friends', description: 'Catch up with friends at the local café.', difficulty: 'Hard'},
    { id: 4, title: 'Workout Session', description: 'Go for a run or do a home workout.', difficulty: 'Easy'},
]; 

router.get('/tasks', (req,res) =>{
    res.json(tasks);
});

module.exports = router; 

