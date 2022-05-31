  function initChat(user) {
    const chatRef = firebase.database().ref("chat");

    // Create a Firechat instance
    const chat = new FirechatUI(chatRef, document.getElementById("firechat-wrapper"));

    chat._chat.on("room-enter", (msg) => {console.log("room-enter", msg)});

    // Set the Firechat user
    chat.setUser(user.uid, user.displayName);

    // Auto-enter "Main" room
    chat._chat.getRoomList((rooms) => {
      for(const id in rooms) {
        if({}.hasOwnProperty.call(rooms, id) === false)
          break;
        if({}.hasOwnProperty.call(rooms[id], "name") === false)
          break;
        if(rooms[id].name === "Main") {
          chat._chat.enterRoom(id);
        }
      }
    });
  }

/**
 * fetch user information given the GitHub user id number
 * @param {string} uid Numeric GitHub user identifier
 * @returns {object} User information from GitHub
 */
const fetchUserInfoFromGitHub = async (uid) => {
  let json, res;
  try {
    res = await fetch(`https://api.github.com/user/${uid}`);
    json = await res.json();
  } catch (err) {
    throw new Error(err);
  }

  return json;
};

function initApp(app) {
  firebase.auth().onAuthStateChanged(async (user) => {
    if (user) {
      const { displayName, photoURL, providerData } = user;
      document.querySelector("#userAvatar img").src = photoURL;
      document.querySelector("#userAvatar").style.display = "inline-block";
      document.getElementById("loginStatus").innerHTML = `<span id="user">${displayName}</span> (<a style="color:white" href="#" onclick="signOut()">Sign Out</a>)`;
      const { uid } = providerData[0];
      app.userSignedIn = true;
      app.uid = uid;
      if (displayName) {
        app.userDisplayName = displayName;
      } else {
        const json = await fetchUserInfoFromGitHub(uid);
        app.userDisplayName = json.login;
      }
      app.userPicture = photoURL;

      initChat(user);

    } else {
      app.userSignedIn = false;
      app.uid = null;
      app.userDisplayName = null;
      app.userGitHubName = null;
      app.userPicture = null;
      document.querySelector("#userAvatar").style.display = "none";
      document.querySelector("#userAvatar img").src = "";
    }
  }, function (error) {
    Sentry.captureException(error);
  });
}
function signIn(app) {
  uiConfig.signInSuccessUrl = location.pathname;
  app.displaySignIn = true;
  setTimeout(() => {
    uiAuth.start('#firebaseui-auth-container', uiConfig);
  }, 500)
}
window.signIn = signIn;
function signOut() {
  firebase.auth().signOut();
  document.getElementById("loginStatus").innerHTML = "";
  document.querySelector("#userAvatar").style.display = "none";
  document.querySelector("#userAvatar img").src = "";
}
window.signOut = signOut;
function startFirebase() {
  uiAuth = new firebaseui.auth.AuthUI(firebase.auth());
  window.addEventListener('load', function () {
    initApp(window.app || {});
  });
}

const config = {
  apiKey: "AIzaSyD1q8d3i0jikA5jRQKcDydFbIw8v2bFRc0",
  authDomain: "cartographer-a6f04.firebaseapp.com",
  databaseURL: "https://cartographer-a6f04.firebaseio.com",
  projectId: "cartographer-a6f04",
  storageBucket: "",
  messagingSenderId: "489953549172"
};
var uiConfig = {
  signInSuccessUrl: '/',
  signInOptions: [
    firebase.auth.GithubAuthProvider.PROVIDER_ID
  ],
  signInFlow: 'popup',
  tosUrl: 'tos.html'
};
window.uiConfig = uiConfig;
var uiAuth;
window.uiAuth = uiAuth;

console.log("firebase.initializeApp");
firebase.initializeApp(config);

startFirebase();
