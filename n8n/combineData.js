// Get all inputs - usando .all() para obtener TODOS los items
const projectsInput = $('GET ASANA PROYECTS11').first().json;
const tasksInput = $input.all();

// Debug para ver qué viene en tasksInput
console.log('Tasks Input:', JSON.stringify(tasksInput, null, 2));

// Get projects array
const projects = projectsInput[0].data;

// Get ALL task groups
const taskGroups = tasksInput.map(item => item.json);

// Debug para ver los grupos de tareas
console.log('Task Groups:', JSON.stringify(taskGroups, null, 2));

// Create array to store projects with their tasks
const projectsWithTasks = projects
    .filter(project => project.resource_type === 'project')
    .map((project, index) => {
        // Get tasks for this project
        const projectTasks = taskGroups[index]?.data || [];
        
        return {
            ...project,
            tasks: projectTasks
        };
    });

// Return the structured data
return {
    json: {
        projects: projectsWithTasks
    }
};
