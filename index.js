require('dotenv').config();
const TaskRouter = require('twilio-taskrouter');
const Twilio = require('twilio');
const AccessToken = Twilio.jwt.AccessToken;
const TaskRouterGrant = AccessToken.TaskRouterGrant;

const token = createAccessToken({
  accountSid: process.env.ACCOUNT_SID,
  signingKeySid: process.env.SIGNING_KEY_SID,
  signingKeySecret: process.env.SIGNING_KEY_SECRET,
  workspaceSid: process.env.WORKSPACE_SID,
  workerSid: process.env.WORKER_SID,
});

const jason = new TaskRouter.Worker(token);

jason.on('ready', (readyJason) => {
  console.log(`Worker ${readyJason.sid} is now ready for work`);
});

jason.on('reservationCreated', (reservation) => {
  console.log(
    `Reservation ${reservation.sid} has been created for ${jason.sid}`,
  );
  console.log(`Task attributes are: ${reservation.task.attributes}`);

  reservation.on('accepted', (acceptedReservation) => {
    console.log(`Reservation ${acceptedReservation.sid} was accepted.`);
  });

  reservation
    .accept()
    .then((acceptedReservation) => {
      console.log(`Reservation status is ${acceptedReservation.status}`);
    })
    .catch((err) => {
      console.log(`Error: ${err}`);
    });
});

function createAccessToken({
  accountSid,
  signingKeySid,
  signingKeySecret,
  workspaceSid,
  workerSid,
}) {
  const taskRouterGrant = new TaskRouterGrant({
    workerSid: workerSid,
    workspaceSid: workspaceSid,
    role: 'worker',
  });

  const accessToken = new AccessToken(
    accountSid,
    signingKeySid,
    signingKeySecret,
  );
  accessToken.addGrant(taskRouterGrant);
  accessToken.identity = 'jason';

  return accessToken.toJwt();
}
