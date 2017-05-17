Template.scoreboard.helpers({
  users(){
    return Meteor.users.find({}, {sort: { score: -1 }});
  },
  isCurrentUser(user){
    return user._id == Meteor.userId();
  }
});