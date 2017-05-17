import Attempts from "/shared/attempts.collection";
import Tasks from "/shared/tasks.collection";
import { FlowRouter } from 'meteor/kadira:flow-router';

Template.taskAttempts.helpers({
  task(){
    return Tasks.findOne(FlowRouter.getParam('_id'));
  },
  attempts(){
    return Attempts.find({task: FlowRouter.getParam('_id')}, {sort: {timestamp: 1}})
  }
});
Template.taskAttempts.events({
  'click .removeAttempt'(event, instance){
    event.preventDefault();
    Meteor.call("removeAttempt", {attempt: instance.$(event.target).attr("data-id")})
  }
})