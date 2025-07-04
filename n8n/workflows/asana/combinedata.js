// Get data from all three nodes
const projects = $('GET ASANA PROJECTS').first().json.data;
const projectTasks = $('GET PROJECT TASKS').first().json;
const taskDetails = $input.all();

// Process each project and its tasks
const processedProjects = projects.map(project => {
    // Find tasks for this project
    const projectTasks = taskDetails
        .filter(detail => 
            detail.json.data.projects?.some(p => p.gid === project.gid)
        )
        .map(detail => {
            const data = detail.json.data;
            return {
                gid: data.gid,
                name: data.name,
                notes: data.notes || '',
                completed: data.completed || false,
                due_on: data.due_on,
                assignee: data.assignee,
                created_at: data.created_at,
                modified_at: data.modified_at,
                tags: data.tags || [],
                workspace: {
                    gid: data.workspace.gid,
                    resource_type: data.workspace.resource_type
                }
            };
        });

    // Return project with its tasks
    return {
        gid: project.gid,
        name: project.name,
        notes: project.notes || '',
        created_at: project.created_at,
        modified_at: project.modified_at,
        workspace: {
            gid: project.workspace.gid,
            resource_type: project.workspace.resource_type
        },
        tasks: projectTasks
    };
});

return [
    {
        projects: processedProjects
    }
];
