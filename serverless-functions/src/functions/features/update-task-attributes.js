const { prepareFlexFunction, twilioExecute } = require(Runtime.getFunctions()['common/helpers/function-helper'].path);

const requiredParameters = [
  { key: 'taskSid', purpose: 'unique ID of task to update' },
  { key: 'attributes', purpose: 'new attributes to merge' }
];

exports.handler = prepareFlexFunction(requiredParameters, async (context, event, callback, response, handleError) => {
  try {
    const { taskSid, attributes } = event;
    
    // Get the task's current attributes
    const task = await twilioExecute(context, (client) =>
      client.taskrouter.v1.workspaces(context.TWILIO_FLEX_WORKSPACE_SID)
        .tasks(taskSid)
        .fetch()
    );
    
    // Merge the new attributes with existing ones
    const currentAttributes = JSON.parse(task.data.attributes);
    const updatedAttributes = {
      ...currentAttributes,
      ...JSON.parse(attributes)
    };
    
    // Update the task with the new attributes
    const result = await twilioExecute(context, (client) =>
      client.taskrouter.v1.workspaces(context.TWILIO_FLEX_WORKSPACE_SID)
        .tasks(taskSid)
        .update({
          attributes: JSON.stringify(updatedAttributes)
        })
    );
    
    response.setBody({
      success: true,
      taskSid: result.data.sid
    });
    
  } catch (error) {
    return handleError(error);
  }
});