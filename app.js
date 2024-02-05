import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.2/firebase-app.js";
import { getAuth, EmailAuthProvider, GoogleAuthProvider, updatePassword, sendEmailVerification, sendPasswordResetEmail, signInWithPopup, updateProfile, onAuthStateChanged, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.7.2/firebase-auth.js";
import {
  setDoc,
  getDoc,
  doc,
  getFirestore,
  collection,
  query,
  onSnapshot,
  orderBy,
  limit,
  addDoc, updateDoc, deleteDoc, where, getDocs
} from "https://www.gstatic.com/firebasejs/10.7.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBULRVCfNUybtfUZRC7HoFlIfIQoyg8I8A",
  authDomain: "isam-chatapp.firebaseapp.com",
  projectId: "isam-chatapp",
  storageBucket: "isam-chatapp.appspot.com",
  messagingSenderId: "90338003392",
  appId: "1:90338003392:web:6d082ce68787f5b33e2025"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const provider = new GoogleAuthProvider();

const loginWithGoogleBtn = document.getElementById("loginWithGoogleBtn")
const logoutBtn = document.getElementById("logoutBtn")
const currentPageName = window.location.pathname.split("/").pop();
const userImg = document.getElementById("uimage")
const signupBtn = document.getElementById("signupBtn")
const signinBtn = document.getElementById("signinBtn")
const lbl = document.getElementById("uemail")
const msgContainer = document.getElementById("msgContainer");
const oneChatContainer = document.getElementById("oneChatContainer");
const sendMessageBtn = document.getElementById("sendMessageBtn")
const sendOneTextBtn = document.getElementById("sendOneText")
const messageInput = document.getElementById("messageInput");
const oneTextInput = document.getElementById("oneText");
const oneTextDiv = document.getElementById("inputContainer");
const resetPass = document.getElementById("resetpass");
const changePass = document.getElementById("changePass");
let searchEmail; // = document.getElementById("searchEmail");
let searchBtn; //= document.getElementById("searchBtn");
const listData = document.getElementById("menu");
let rEmail // = "isamboy94@gmail.com";
let email;
let password;
let udisplayName;
let ruid // = "3rFDXBHl1PMsF6N800V4fPdisxK2";
const toggleButton = document.getElementById("toggleButton");

function toggleMenu() {
  const menuList = document.querySelector('.menu-list');
  const isMenuVisible = menuList.style.display === 'block';

  if (isMenuVisible) {
    menuList.style.display = 'none';
  } else {
    menuList.style.display = 'block';
  }
}
toggleButton && toggleButton.addEventListener("click", toggleMenu)

function hideMenu() {
  const menuList = document.querySelector('.menu-list');
  menuList.style.display = 'none';
}

// const storeUsersFromMessages = async () => {
//   try {
//     const messagesRef = collection(db, "messages");
//     const querySnapshot = await getDocs(messagesRef);

//     querySnapshot.forEach(async (messageDoc) => {
//       const message = messageDoc.data();
//       const { uid, displayName, photoURL, email } = message;

//       // Check if the user already exists in the "users" collection
//       const userRef = doc(db, "users", uid.toString());
//       const userSnapshot = await getDoc(userRef);

//       if (!userSnapshot.exists()) {
//         // If the user doesn't exist, add them to the "users" collection
//         const userData = {
//           displayName,
//           photoURL,
//           uid,
//           email,
//         };

//         await setDoc(userRef, userData);

//         console.log(`User with UID ${uid} added to the "users" collection.`);
//       } else {
//         console.log(`User with UID ${uid} already exists in the "users" collection.`);
//       }
//     });
//   } catch (error) {
//     console.error("Error storing users from messages:", error);
//   }
// };

// Call the function to store users from messages
// storeUsersFromMessages();

const storeUserData = async (uid, displayName, photoURL, email) => {
  try {
    const userRef = doc(db, "users", uid);
    const userSnapshot = await getDoc(userRef);

    // Check if the user already exists
    if (!userSnapshot.exists()) {
      // If the user doesn't exist, add them to the "users" collection
      const userData = {
        displayName,
        photoURL,
        uid,
        email
      };

      await setDoc(userRef, userData);

      // console.log(`User with UID ${uid} added to the "users" collection.`);
    } else {
      // console.log(`User with UID ${uid} already exists in the "users" collection.`);
    }
  } catch (error) {
    console.error("Error storing user data:", error);
  }
};


function scrollToBottom() {
  msgContainer.scrollTop = msgContainer.scrollHeight;
}

function scrollOneChat() {
  oneChatContainer.scrollTop = oneChatContainer.scrollHeight;
}

const uniqueUsers = new Set(); // Move this outside the function

const uniqueUserDisplayNames = new Set();

const userMap = new Map();

const loadList = ({ uid }) => {

  const q1 = query(collection(db, "onechat"), where("Sender", "==", uid));
  const q2 = query(collection(db, "onechat"), where("Receiver", "==", uid));

  try {
    const unsubscribe1 = onSnapshot(q1, (querySnapshot1) => {
      const docs1 = querySnapshot1.docs.map(doc => doc.data());
      const unsubscribe2 = onSnapshot(q2, (querySnapshot2) => {
        const docs2 = querySnapshot2.docs.map(doc => doc.data());

        const combinedDocs = [...docs1, ...docs2];

        combinedDocs.forEach(messages => {
          // Check if the user is not the current user and add their display name to the map
          if (messages.Sender !== uid) {
            userMap.set(messages.senderDisplayName, {
              displayName: messages.senderDisplayName,
              photoURL: messages.sPhotoURL,
              ruid: messages.Sender,
              rEmail: messages.sEmail
            });
          } else if (messages.Receiver !== uid) {
            userMap.set(messages.rDisplayName, {
              displayName: messages.rDisplayName,
              photoURL: messages.rPhotoURL,
              ruid: messages.Receiver,
              rEmail: messages.rEmail
            });
          }
        });

        // Now, you can use userMap to render your list
        const messagesHTML = Array.from(userMap.values()).map(({ displayName, photoURL, ruid }) => {
          // Render your list item based on the display name and photo URL
          // Replace this with your actual rendering logic
          return `
            <li>
              <img src="${photoURL}" alt="User Image">
              <p class="chat-user" data-ruid="${ruid}" data-rEmail="${rEmail}">${displayName}</p>
            </li>
          `;
        }).join("");

        // Add an event listener to all elements with the 'chat-user' class
        listData.innerHTML = `<li class="menu-title">Chats</li>
        <li><input type="text" id="searchEmail" placeholder="Search via email address"><button class="btn btn-sm"
                id="searchBtn">Enter</button></li>${messagesHTML}`;

        searchBtn = document.getElementById("searchBtn");
        searchBtn.addEventListener('click', () => {
          chatUser();
        });
        searchEmail = document.getElementById("searchEmail");
        listData.addEventListener('click', (event) => {
          if (event.target.classList.contains('chat-user')) {
            ruid = event.target.dataset.ruid;
            rEmail = event.target.dataset.rEmail;
            hideMenu();
            // console.log(rEmail);
            openChat();
          }
        });
      });
    });
    // toggleMenu();

  } catch (error) {
    console.error("Error loading messages:", error);
  }
};

const openChat = () => {
  showOneText();
  const user = auth.currentUser;
  // console.log(ruid + rEmail);
  // console.log(`Opening chat with ${ruid}`);
  loadOneMessages(user);
};

const loadOneMessages = ({ uid }) => {
  // console.log(ruid);

  const q1 = query(collection(db, "onechat"), where("Sender", "==", uid), where("Receiver", "==", ruid));
  const q2 = query(collection(db, "onechat"), where("Sender", "==", ruid), where("Receiver", "==", uid));

  try {
    const unsubscribe1 = onSnapshot(q1, (querySnapshot1) => {
      const docs1 = querySnapshot1.docs.map(doc => doc.data());
      const unsubscribe2 = onSnapshot(q2, (querySnapshot2) => {
        const docs2 = querySnapshot2.docs.map(doc => doc.data());

        const combinedDocs = [...docs1, ...docs2];

        const orderedDocs = combinedDocs.sort((a, b) => a.createdAt - b.createdAt);

        const messagesHTML = orderedDocs
          .map((messages) => {
            // console.log(messages);
            const timestamp = messages.createdAt;
            const date = new Date(timestamp);
            const hours = date.getHours();
            const minutes = date.getMinutes();
            const formattedTime = `${hours}:${minutes}`;

            if (messages.Sender === uid && messages.Receiver === ruid) {
              const chatType = messages.text;
              // console.log(messages.senderDisplayName+messages.rDisplayName)
              return `
                <div class="chat chat-end">
                  <div class="chat-image avatar">
                    <div class="w-10 rounded-full">
                      <img alt="Tailwind CSS chat bubble component" src="${messages.sPhotoURL}" />
                    </div>
                  </div>
                  <div class="chat-header">
                    ${messages.senderDisplayName}
                    <time class="text-xs opacity-50">${formattedTime}</time>
                  </div>
                  <div class='chat-bubble'>${chatType}</div>
                  <div class="chat-footer opacity-50">Delivered</div>
                </div>
              `;
            } else if (messages.Sender === ruid && messages.Receiver === uid) {
              const chatType = messages.text;
              return `
                <div class="chat chat-start">
                  <div class="chat-image avatar">
                    <div class="w-10 rounded-full">
                      <img alt="Tailwind CSS chat bubble component" src="${messages.sPhotoURL}" />
                    </div>
                  </div>
                  <div class="chat-header">
                    ${messages.senderDisplayName}
                    <time class="text-xs opacity-50">${formattedTime}</time>
                  </div>
                  <div class='chat-bubble'>${chatType}</div>
                  <div class="chat-footer opacity-50">Delivered</div>
                </div>
              `;
            }
          })
          .join("");

        // console.log(messagesHTML);
        oneChatContainer.innerHTML = messagesHTML;
        scrollOneChat();
      });
    });
  } catch (error) {
    console.error("Error loading messages:", error);
  }
};

const loadMessages = ({ uid }) => {
  const q = query(collection(db, "messages"), orderBy("createdAt"), limit(25));

  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const messagesHTML = querySnapshot.docs
      .map((doc) => {
        const messages = doc.data();
        const timestamp = messages.createdAt;
        const date = new Date(timestamp);
        const hours = date.getHours();
        const minutes = date.getMinutes();
        const formattedTime = `${hours}:${minutes}`;

        const isMyChat = messages.uid === uid ? "chat-end" : "chat-start";
        const chatType = messages.text;

        return `
            <div class="chat ${isMyChat}">
              <div class="chat-image avatar">
                <div class="w-10 rounded-full">
                  <img alt="Tailwind CSS chat bubble component" src="${messages.photoURL}" />
                </div>
              </div>
              <div class="chat-header">
                ${messages.displayName}
                <time class="text-xs opacity-50">${formattedTime}</time>
              </div>
              <div class='chat-bubble'>${chatType}</div>
              <div class="chat-footer opacity-50">Delivered</div>
            </div>
          `;
      })
      .join("");

    // console.log(messagesHTML)
    // console.log(msgContainer)
    msgContainer.innerHTML = messagesHTML;
    scrollToBottom();
  });
};

const onLoad = () => {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      // console.log(user.uid, user.displayName, user.photoURL);
      storeUserData(user.uid, user.displayName, user.photoURL, user.email);
      // Check if the user's email is verified
      if (!user.emailVerified) {
        alert("Please verify your email before accessing the chat.");
        logOut();
        window.location.href = "index.html";
        return;
      }
      else if (user.emailVerified) {
        // loadMessages(user);
        // loadOneMessages(user);

        if (currentPageName !== "chatapp.html" && currentPageName !== "onechat.html") {
          window.location.href = "chatapp.html";
        }
        if (currentPageName === "chatapp.html") {
          loadMessages(user);
        }
        if (currentPageName === "onechat.html") {
          loadList(user);
        }
        lbl.innerText = user.displayName;
        if (user.photoURL) {
          userImg.src = user.photoURL;
        }
      }
    } else {
      if (
        currentPageName !== "index.html" && currentPageName !== "" && currentPageName !== "signup.html" && currentPageName !== "") {
        window.location.href = "index.html";
      }
    }
  });
};

onLoad()


const sendChatMessage = async () => {
  const user = auth.currentUser;
  const text = oneTextInput.value;
  const id = Date.now();
  let rDisplayName;
  let rPhotoURL;
  rEmail = searchEmail.value; // PUT IN searchEmail.addEventListener
  // console.log(rEmail)
  const q = query(collection(db, "users"), where("uid", "==", ruid));

  const querySnapshot = await getDocs(q);
  querySnapshot.forEach((doc) => {
    rEmail = doc.data().email;
    rDisplayName = doc.data().displayName;
    rPhotoURL = doc.data().photoURL;
    // console.log("UID for email ", rEmail, ruid);
  });

  try {
    if (user) {
      if (text.trim()) {
        const { email, displayName, photoURL, uid } = user;
        const payload = {
          createdAt: id,
          dicId: id,
          text,
          Receiver: ruid,
          rEmail,
          rDisplayName,
          rPhotoURL,
          Sender: uid,
          sEmail: email,
          senderDisplayName: displayName,
          sPhotoURL: photoURL
        };

        await setDoc(doc(db, "onechat", `${id}`), payload);
        oneTextInput.value = "";
        scrollOneChat();
      } else {
        alert("Please write a message first!");
      }
    }
  } catch (err) {
    console.error(err);
  }
};

const sendMessage = async ({ type = "text" }) => {
  const user = auth.currentUser;
  const text = messageInput.value;
  const id = Date.now();
  try {
    if (user) {
      if (text.trim()) {
        const { email, displayName, photoURL, uid } = user;
        const payload = {
          createdAt: id,
          dicId: id,
          text,
          uid,
          email,
          displayName,
          photoURL
          //   type,
          //   ...(type === uploadTypes.image && { imageURL }),
        };

        await setDoc(doc(db, "messages", `${id}`), payload);
        messageInput.value = "";
        scrollToBottom();
      } else {
        alert("Please Input Text");
      }
    }
  } catch (err) {
    // console.log(err);
  }
};

const addDataInFirestore = async () => {
  const fName = document.getElementById("fname").value;
  const lName = document.getElementById("lname").value;
  email = document.getElementById("emailid").value;  // Declare at a higher scope
  password = document.getElementById("pass").value;  // Declare at a higher scope
  const cpass = document.getElementById("cpass").value;

  udisplayName = `${fName} ${lName}`;

  // console.log(udisplayName);
  if (password === cpass && cpass !== "" && fName !== "" && lName !== "" && email !== "") {
    // console.log(fName + lName + email + password + cpass);
    if (cpass.length < 6 && password.length < 6) {
      alert("Please enter a password atleast 6 characters long!")
    }
    else {
      createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
          const user = userCredential.user;
          sendEmailVerification(auth.currentUser)
            .then(() => {
              // ...
            });
          // You can redirect the user or perform other actions here
          updateProfile(auth.currentUser, {
            displayName: udisplayName, photoURL: "https://api-private.atlassian.com/users/4f5f736dffd9036ec97f3e366931bc7c/avatar"
          }).then(() => {

          }).catch((error) => {
            // An error occurred
            // ...
          });
          // console.log("here");

        })
        .catch((error) => {
          const errorCode = error.code;
          const errorMessage = error.message;
          console.error("Error during sign up:", errorCode, errorMessage);
        });
    }
  }
  else {
    alert("Please fill all the fields!")
  }
};

const forgotPassword = () => {
  const emailInput = document.getElementById("email");
  if (emailInput) {
    const email = document.getElementById("email").value;
    if (email != "") {
      sendPasswordResetEmail(auth, email)
        .then(() => {
          alert("Password reset email sent!");
          // You can add code to show a success message or redirect the user
        })
        .catch((error) => {
          const errorCode = error.code;
          const errorMessage = error.message;
          console.error("Error sending password reset email:", errorCode, errorMessage);
          // You can add code to show an error message to the user
        });
    }
    else {
      alert("Please enter email to reset password!");
    }
  }
  else if (!emailInput) {
    const user = auth.currentUser;
    const email = user.email;
    sendPasswordResetEmail(auth, email)
      .then(() => {
        alert("Password reset email sent!");
        // You can add code to show a success message or redirect the user
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.error("Error sending password reset email:", errorCode, errorMessage);
        // You can add code to show an error message to the user
      });
  }
}

const showOneText = () => {
  oneTextDiv.classList.remove("hide");
  oneTextDiv.classList.add("show");
}
const hideOneText = () => {
  oneTextDiv.classList.remove("show");
  oneTextDiv.classList.add("hide");

}

const addHoverEffect = () => {
  resetPass.classList.add("hover-effect");
};

const removeHoverEffect = () => {
  resetPass.classList.remove("hover-effect");
};

// const promptUserForCredential = () => {

// };

// Implement your own reauthentication method
const reauthenticateWithCredential = async (user, credential) => {
  try {
    // Use the appropriate reauthentication method based on your authentication setup.
    // For email and password, you can use reauthenticateWithEmailAndPassword.
    const credentialResult = await signInWithEmailAndPassword(auth, credential.email, credential.password);

    // Return the user credential if reauthentication is successful.
    return credentialResult;
  } catch (error) {
    console.error("Reauthentication failed:", error);
    // Return null if reauthentication fails.
    return null;
  }
};


const changePassword = async () => {
  const user = auth.currentUser;
  const email = user.email;
  const pass = prompt("Enter your current password: ");
  const newPassword = prompt("Enter new password");
  const newcPassword = prompt("Confirm your password");

  if (newPassword.length < 6) {
    alert("Password should be at least 6 characters long!");
    return;
  }

  if (newPassword === newcPassword && newPassword.length >= 6) {
    try {
      // Reauthenticate the user
      const credential = { email, pass } // Implement your credential prompt

      if (!credential) {
        alert("Reauthentication failed.");
        return;
      }

      await reauthenticateWithCredential(user, credential);

      // Update the password
      await updatePassword(user, newPassword);
      alert("Password updated successfully!");
    } catch (error) {
      console.error("Error updating password:", error);
      alert("Error updating password. Please try again.");
    }
  } else if (newPassword !== newcPassword) {
    alert("Error! Your passwords don't match!");
  }
};

const chatUser = async () => {
  const user = auth.currentUser;
  // console.log("here");
  const id = Date.now();
  let rDisplayName;
  let rPhotoURL;
  rEmail = searchEmail.value;
  // console.log(rEmail);
  const q = query(collection(db, "users"), where("email", "==", rEmail));
  const querySnapshot = await getDocs(q);
  // console.log(querySnapshot);

  // Check if the data is already in userMap
  const isDataPresent = Array.from(userMap.values()).some(user => user.rEmail === rEmail);

  if (!isDataPresent) {
    querySnapshot.forEach((doc) => {
      ruid = doc.data().uid;
      rDisplayName = doc.data().displayName;
      rPhotoURL = doc.data().photoURL;
    });

    // console.log(rEmail, ruid, rDisplayName, rPhotoURL);
    // console.log(listData);

    if (querySnapshot.docs.length > 0) {
      // Remove the last </ul> from the existing content
      listData.innerHTML = listData.innerHTML.replace(/<\/ul>$/, '');

      // Append the new content
      listData.insertAdjacentHTML('beforeend', `<li>
        <img src="${rPhotoURL}" alt="User Image">
        <p class="chat-user" data-ruid="${ruid}" data-rEmail="${rEmail}">${rDisplayName}</p>
      </li></ul>`);

      // sendChatMessage();
      // console.log('here');
    } else {
      searchEmail.value = "";
      searchEmail.placeholder = "User doesn't exist!";
    }
  } else {
    searchEmail.value = "";
    searchEmail.placeholder = "User already in your chat!"
  }
};




resetPass && resetPass.addEventListener("click", forgotPassword);
resetPass && resetPass.addEventListener("mouseover", addHoverEffect);
resetPass && resetPass.addEventListener("mouseout", removeHoverEffect);

resetPass && resetPass.addEventListener("click", forgotPassword);
changePass && changePass.addEventListener("click", changePassword);

sendMessageBtn && sendMessageBtn.addEventListener("click", sendMessage);
sendOneTextBtn && sendOneTextBtn.addEventListener("click", sendChatMessage);

signupBtn && signupBtn.addEventListener("click", addDataInFirestore)

const signIn = () => {
  email = document.getElementById("email").value;
  password = document.getElementById("password").value;
  // console.log(email + password);
  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      // Signed in 
      // const user = userCredential.user;
      // storeUserData(user.uid, user.displayName, user.photoURL);
      // console.log(user);
      // ...
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      // console.error(errorCode + errorMessage);
      alert("Invalid credentials!")
    });
}

signinBtn && signinBtn.addEventListener("click", signIn)

const signInWithGoogle = () => {
  signInWithPopup(auth, provider)
    .then((result) => {
      // console.log(result)
      // const user = userCredential.user;
      // storeUserData(user.uid, user.displayName, user.photoURL);
    }).catch((error) => {
      console.error(error)
    });
}

const logOut = () => {
  signOut(auth).then(() => {
    // Sign-out successful.
  }).catch((error) => {
    // An error happened.
  });
}


loginWithGoogleBtn && loginWithGoogleBtn.addEventListener("click", signInWithGoogle)

logoutBtn && logoutBtn.addEventListener("click", logOut)
