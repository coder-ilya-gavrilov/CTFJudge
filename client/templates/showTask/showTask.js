import Attempts from "/shared/attempts.collection";
import Tasks from "/shared/tasks.collection";
import { FlowRouter } from 'meteor/kadira:flow-router';

Template.showTask.onRendered(function(){
  Session.set("taskFailed", false);
})
Template.showTask.helpers({
  taskCompletion(){
    if (Tasks.findOne(FlowRouter.getParam('_id')).opened === false)
      return "warning";
    var result = Attempts.find({task: FlowRouter.getParam('_id'), userId: Meteor.userId()}).count();
    if (result == 0)
      return "default";
    else if (Attempts.findOne({task: FlowRouter.getParam('_id'), userId: Meteor.userId(), success: true}) == null)
      return "danger";
    else
      return "success";
  },
  taskCompleted(){
    return Attempts.find({task: FlowRouter.getParam('_id'), userId: Meteor.userId(), success: true}).count() > 0;
  },
  winners(){
    var winners = Attempts.find({task: FlowRouter.getParam('_id'), success: true}).map(attempt => attempt.user).join(", ");
    return (winners == "") ? "Решивших нет. Станьте первым!" : "Решили: " + winners;
  },
  taskFailed(){
    return Session.get("taskFailed");
  },
  task(){
    return Tasks.findOne(FlowRouter.getParam('_id'));
  }
});
Template.showTask.events({
  'click #surrenderTask'(event, instance){
    event.preventDefault();
    Meteor.call("surrenderTask", {task: FlowRouter.getParam("_id"), flag: instance.$("[name='flag']").val()}, function(error, result){
      if (!result)
        Session.set("taskFailed", true);
    })
  },
  'click .alert-dismissible .close'(event, instance){
    event.preventDefault();
    Session.set("fail", false);
  }
})