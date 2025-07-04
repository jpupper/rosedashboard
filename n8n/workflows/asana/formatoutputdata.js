// Get data from all three nodes
const projects = $('GET ASANA PROJECTS').json.data;
const projectTasks = $input.all();

// Log input data for debugging
console.log('Projects:', JSON.stringify(projects, null, 2));
console.log('Project Tasks:', JSON.stringify(projectTasks, null, 2));

// Process each project
const processedProjects = projects.map(project => {
    // Find the task list for this project
    const projectTasksData = projectTasks.find(item => {
        return item.json && 
               item.json.data && 
               Array.isArray(item.json.data) && 
               item.json.data.length > 0;
    });

    // Get tasks for this project
    const tasks = [];
    if (projectTasksData && projectTasksData.json.data) {
        projectTasksData.json.data.forEach(taskData => {
            // Only add tasks that have data
            if (taskData) {
                tasks.push({
                    gid: taskData.gid,
                    name: taskData.name,
                    notes: taskData.notes || '',
                    description: taskData.description || '',
                    completed: taskData.completed || false,
                    due_on: taskData.due_on,
                    assignee: taskData.assignee,
                    created_at: taskData.created_at,
                    modified_at: taskData.modified_at,
                    resource_type: taskData.resource_type,
                    tags: taskData.tags || [],
                    workspace: taskData.workspace
                });
            }
        });
    }

    // Return project with its tasks and all available fields
    return {
        gid: project.gid,
        name: project.name,
        resource_type: project.resource_type,
        description: project.description || '',
        notes: project.notes || '',
        archived: project.archived || false,
        color: project.color || null,
        created_at: project.created_at,
        current_status: project.current_status,
        custom_fields: project.custom_fields || [],
        default_view: project.default_view,
        due_date: project.due_date,
        due_on: project.due_on,
        html_notes: project.html_notes || '',
        members: project.members || [],
        modified_at: project.modified_at,
        owner: project.owner,
        permalink_url: project.permalink_url,
        public: project.public,
        start_on: project.start_on,
        workspace: project.workspace,
        tasks: tasks
    };
});

// Return final formatted data
return [
    {
        projects: processedProjects.filter(project => project.resource_type === 'project')
    }
];
