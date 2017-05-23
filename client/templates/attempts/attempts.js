import Attempts from "/shared/attempts.collection";
import Tasks from "/shared/tasks.collection";
import { FlowRouter } from 'meteor/kadira:flow-router';

Template.attempts.helpers({
  showTask(){
    return !FlowRouter.getParam('_id');
  },
  task(){
    return Tasks.findOne(FlowRouter.getParam('_id')) || {};
  },
  attempts(){
    let id = FlowRouter.getParam('_id');
    let params = {};
    if (id) {
      params.task = id;
    }
    return Attempts.find(params, {sort: {timestamp: 1}});
  },
  getClass(attempt){
    if (attempt.success)
      return "success";
    else
      return "danger";
  },
  getTask(attempt){
    return Tasks.findOne(attempt.task).name;
  }
});
Template.attempts.events({
  'click .removeAttempt'(event, instance){
    event.preventDefault();
    Meteor.call("removeAttempt", {attempt: instance.$(event.target).attr("data-id")})
  }
})