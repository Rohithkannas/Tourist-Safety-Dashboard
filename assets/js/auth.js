
(function () {
  const през_firebase = document.getElementById("login-firebase");
  const през_demo = document.getElementById("login-demo");
  const logoutButton = document.getElementById("logout-button");

  if (през_demo) {
    през_demo.addEventListener("click", () => {
      // Simulate a user object for demo purposes
      const demoUser = {
        uid: "demo-user",
        displayName: "Demo User",
        email: "demo@example.com",
      };
      sessionStorage.setItem("loggedInUser", JSON.stringify(demoUser));
      window.location.href = "dashboard.html";
    });
  }

  if (през_firebase) {
    през_firebase.addEventListener("click", () => {
      const email = prompt("Enter your email");
      const password = prompt("Enter your password");

      if (email && password) {
        firebase
          .auth()
          .signInWithEmailAndPassword(email, password)
          .then((userCredential) => {
            // Signed in
            const user = userCredential.user;
            sessionStorage.setItem("loggedInUser", JSON.stringify(user));
            window.location.href = "dashboard.html";
          })
          .catch((error) => {
            if (error.code === "auth/user-not-found") {
              // If user not found, sign them up
              firebase
                .auth()
                .createUserWithEmailAndPassword(email, password)
                .then((userCredential) => {
                  const user = userCredential.user;
                  const db = firebase.firestore();
                  db.collection("users")
                    .doc(user.uid)
                    .set({
                      name: "New User",
                      role: "tourist",
                      signupTimestamp: firebase.firestore.FieldValue.serverTimestamp(),
                    })
                    .then(() => {
                      sessionStorage.setItem("loggedInUser", JSON.stringify(user));
                      window.location.href = "dashboard.html";
                    });
                })
                .catch((error) => {
                  alert(error.message);
                });
            } else {
              alert(error.message);
            }
          });
      }
    });
  }

  if (logoutButton) {
    logoutButton.addEventListener("click", () => {
      if (firebase.auth().currentUser) {
        firebase
          .auth()
          .signOut()
          .then(() => {
            sessionStorage.removeItem("loggedInUser");
            window.location.href = "login.html";
          });
      } else {
        sessionStorage.removeItem("loggedInUser");
        window.location.href = "login.html";
      }
    });
  }

  // Protect dashboard route
  if (window.location.pathname.endsWith("dashboard.html")) {
    const user = JSON.parse(sessionStorage.getItem("loggedInUser"));
    if (!user) {
      window.location.href = "login.html";
    }
  }
})();
