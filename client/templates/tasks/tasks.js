import Tasks from "/shared/tasks.collection";
import Attempts from "/shared/attempts.collection";
import { FlowRouter } from 'meteor/kadira:flow-router';

Template.tasks.helpers({
  tasks(){
    return Tasks.find({}, {sort: {category: 1, cost: 1}});
  },
  taskCompletion(task){
    if (task.opened === false) 
      return "warning";
    var result = Attempts.find({task: task._id, userId: Meteor.userId()}).count();
    if (result == 0)
      return "default";
    else if (Attempts.findOne({task: task._id, userId: Meteor.userId(), success: true}) == null)
      return "danger";
    else
      return "success";
  }
});
Template.tasks.events({
  'click #tasks tbody tr td'(event, instance){
    FlowRouter.go('tasks.showTask', {_id: instance.$(event.target).parent("tr").attr("data-id")})
  },
});