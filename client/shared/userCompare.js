import Attempts from "/shared/attempts.collection";

function userCompare(user1, user2) {
  if (user1.score > user2.score)
    return -1;
  if (user1.score < user2.score)
    return 1;
  var attempt1 = Attempts.findOne({userId: user1._id, success: true}, {sort: {timestamp: -1}});
  var attempt2 = Attempts.findOne({userId: user2._id, success: true}, {sort: {timestamp: -1}});
  if (!attempt1)
    return 1;
  if (!attempt2)
    return -1;
  if (attempt1.timestamp < attempt2.timestamp)
    return -1;
  if (attempt1.timestamp > attempt2.timestamp)
    return 1;
  return 0;
}

export { userCompare };
