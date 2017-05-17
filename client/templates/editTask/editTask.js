import Tasks from "/shared/tasks.collection";
import { FlowRouter } from 'meteor/kadira:flow-router';

Template.editTask.helpers({
  task(){
    return Tasks.findOne(FlowRouter.getParam('_id'));
  },
  tasks(){
    return Tasks.find({}, {sort: {category: 1, cost: 1}});
  },
  taskOpened() {
    if (this.task.opened)
      return "checked";
    return "";
  },
  taskWithoutParent() {
    if (this.task.parent)
      return "selected";
    return "";
  },
  taskWithParent(parentTask) {
    if (this.task.parent == parentTask._id)
      return "selected";
    return "";
  },
  isDifferentTask(task) {
    return this.task._id != task._id;
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
  'click #editTask'(event, instance){
    event.preventDefault();
    Meteor.call("editTask", {
      task: Session.get("currentTask"),
      name: instance.$("[name='taskName']").val(),
      description: instance.$("[name='taskDescription']").val(),
      attachment: instance.$("[name='taskAttachment']").val(),
      category: instance.$("[name='taskCategory']").val(),
      flag: instance.$("[name='taskFlag']").val().toLowerCase().trim(),
      cost: parseInt(instance.$("[name='taskCost']").val()),
      parent: instance.$("[name='taskParent']").val(),
      opened: instance.$("[name='taskOpened']").is(':checked')
    });
    FlowRouter.go('tasks.showTask', {_id: FlowRouter.getParam("_id")});
  }
});