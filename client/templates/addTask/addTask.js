import Tasks from "/shared/tasks.collection";
import { FlowRouter } from 'meteor/kadira:flow-router';

Template.addTask.events({
  'click #addTask'(event, instance){
    event.preventDefault();
    Meteor.call("addTask", {
      name: instance.$("[name='taskName']").val(),
      description: instance.$("[name='taskDescription']").val(),
      attachment: instance.$("[name='taskAttachment']").val(),
      category: instance.$("[name='taskCategory']").val(),
      flag: instance.$("[name='taskFlag']").val().toLowerCase().trim(),
      cost: parseInt(instance.$("[name='taskCost']").val()),
      parent: instance.$("[name='taskParent']").val(),
      opened: instance.$("[name='taskOpened']").is(':checked')
    })
    FlowRouter.go('home');
  }
});
Template.addTask.helpers({
  tasks(){
    return Tasks.find({}, {sort: {category: 1, cost: 1}});
  }
});