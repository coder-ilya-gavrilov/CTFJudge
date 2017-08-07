import Tasks from "/shared/tasks.collection";
import { FlowRouter } from 'meteor/kadira:flow-router';

Template.editTask.helpers({
  task(){
    return Tasks.findOne(FlowRouter.getParam('_id')) || {};
  },
  tasks(){
    return Tasks.find({}, {sort: {category: 1, cost: 1}});
  },
  taskOpened() {
    let task = Tasks.findOne(FlowRouter.getParam('_id')) || {};
    if (task.opened)
      return "checked";
    return "";
  },
  taskWithoutParent() {
    let task = Tasks.findOne(FlowRouter.getParam('_id')) || {};
    if (task.parent)
      return "selected";
    return "";
  },
  taskWithParent(parentTask) {
    let task = Tasks.findOne(FlowRouter.getParam('_id')) || {};
    if (task.parent == parentTask._id)
      return "selected";
    return "";
  },
  isDifferentTask(otherTask) {
    let task = Tasks.findOne(FlowRouter.getParam('_id')) || {};
    return task._id != otherTask._id;
  },
  editing() {
    return FlowRouter.getParam('_id');
  }
});
Template.editTask.events({
  'click #removeTask'(event, instance){
    event.preventDefault();
    if (confirm('Удалить задание?')) {
      Meteor.call("removeTask", {task: FlowRouter.getParam("_id")});
      FlowRouter.go('tasks.list');
    }
  },
  'click #save'(event, instance){
    event.preventDefault();
    let id = FlowRouter.getParam('_id');
    let data = {
      name: instance.$("[name='taskName']").val(),
      description: instance.$("[name='taskDescription']").val(),
      attachment: instance.$("[name='taskAttachment']").val(),
      category: instance.$("[name='taskCategory']").val(),
      flag: instance.$("[name='taskFlag']").val().toLowerCase().trim(),
      cost: parseInt(instance.$("[name='taskCost']").val()) || 0,
      penalty: parseInt(instance.$("[name='taskPenalty']").val()) || 0,
      parent: instance.$("[name='taskParent']").val(),
      opened: instance.$("[name='taskOpened']").is(':checked')
    };
    if (id) {
      data.taskId = id;
      Meteor.call("editTask", data);
      FlowRouter.go('tasks.show', {_id: id});
    } else {
      Meteor.call("addTask", data);
      FlowRouter.go('home');
    }
  }
});