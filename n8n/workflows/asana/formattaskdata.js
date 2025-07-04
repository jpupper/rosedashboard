const data = $('FormatInput').item;
const projectData = $input.all()[0].json;
const projectId = projectData.gid;

const tasks = data.json.parameters.tasks;

const items = tasks.map(task => ({
  json: {
    taskName: task.name,
    projects: projectId,
    taskDescription: task.description
  }
}));


return items;