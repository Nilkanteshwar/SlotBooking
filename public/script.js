// Initialize Firebase
const firebaseConfig = {
    apiKey: "AIzaSyCVOv_S06fJ55GXs4niahoD5nqE45S0EAI",
    authDomain: "slotbooking-98856.firebaseapp.com",
    projectId: "slotbooking-98856",
    storageBucket: "slotbooking-98856.appspot.com",
    messagingSenderId: "415042897650",
    appId: "1:415042897650:web:69de6cd2161c113a37f26b",
    measurementId: "G-6E5QN0DKGN"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Function to sign up a user
function signup() {
    const email = document.getElementById('signup-email').value;
    const username = document.getElementById('signup-username').value;
    const password = document.getElementById('signup-password').value;

    // Check if email or username already exists
    db.collection("users").where("email", "==", email)
        .get()
        .then((querySnapshot) => {
            if (!querySnapshot.empty) {
                alert('Email already exists. Please choose a different one.');
                return;
            } else {
                // Proceed with signup
                db.collection("users").where("username", "==", username)
                    .get()
                    .then((querySnapshot) => {
                        if (!querySnapshot.empty) {
                            alert('Username already exists. Please choose a different one.');
                            return;
                        } else {
                            // Create user in Firestore
                            db.collection("users").add({
                                email: email,
                                username: username,
                                password: password
                            })
                                .then((docRef) => {
                                    alert('Sign up successful! Please login.');
                                    window.location.href = "index.html"; // Redirect to login page
                                })
                                .catch((error) => {
                                    console.error("Error adding document: ", error);
                                });
                        }
                    })
                    .catch((error) => {
                        console.log("Error getting documents: ", error);
                    });
            }
        })
        .catch((error) => {
            console.log("Error getting documents: ", error);
        });
}

// Function to login
function login() {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    // Check user credentials in Firestore
    db.collection("users").where("email", "==", email).where("password", "==", password)
        .get()
        .then((querySnapshot) => {
            if (!querySnapshot.empty) {
                alert('Login successful!');
                window.location.href = "booking.html"; // Redirect to booking page
            } else {
                alert('Invalid email or password.');
            }
        })
        .catch((error) => {
            console.log("Error getting documents: ", error);
        });
}

// Function to book a slot
function bookSlot() {
    const name = document.getElementById('name').value;
    const company = document.getElementById('company').value;
    const date = document.getElementById('booking-date').value;
    const startTime = document.getElementById('start-time').value;
    const endTime = document.getElementById('end-time').value;

    // Check if the slot overlaps with existing bookings
    db.collection("bookings")
        .where('date', '==', date)
        .get()
        .then((querySnapshot) => {
            let overlap = false;
            querySnapshot.forEach((doc) => {
                const slotData = doc.data();
                if (startTime < slotData.endTime && endTime > slotData.startTime) {
                    overlap = true;
                }
            });
            if (overlap) {
                alert('Slot overlaps with existing booking. Please choose a different time.');
            } else {
                // Save booking data to Firestore
                db.collection("bookings").add({
                    name: name,
                    company: company,
                    date: date,
                    startTime: startTime,
                    endTime: endTime
                })
                .then((docRef) => {
                    alert('Slot booked successfully!');
                    fetchSlots(); // Refresh the slot table after booking
                })
                .catch((error) => {
                    console.error("Error adding document: ", error);
                });
            }
        })
        .catch((error) => {
            console.log("Error checking existing bookings: ", error);
        });
}


// Function to fetch and display booked slots
// function fetchSlots() {
//     db.collection("bookings").get()
//         .then((querySnapshot) => {
//             const slotTableBody = document.getElementById('slot-table-body');
//             slotTableBody.innerHTML = ''; // Clear existing rows

//             const currentDate = new Date(); // Get current date and time

//             querySnapshot.forEach((doc) => {
//                 const slotData = doc.data();
//                 const startTime12Hour = convertTo12HourFormat(slotData.startTime);
//                 const endTime12Hour = convertTo12HourFormat(slotData.endTime);

//                 // Check if the slot is overdue
//                 const slotDateTime = new Date(`${slotData.date}T${slotData.endTime}`);
//                 const overdueClass = (slotDateTime < currentDate) ? 'overdue' : '';

//                 const slotRow = `
//                     <tr class="${overdueClass}">
//                         <td>${slotData.name}</td>
//                         <td>${slotData.company}</td>
//                         <td>${slotData.date}</td>
//                         <td>${startTime12Hour}</td>
//                         <td>${endTime12Hour}</td>
//                         <td>${startTime12Hour} - ${endTime12Hour}</td>
//                         <td>
//                             <button class="btn btn-info" onclick="editSlot('${doc.id}', '${slotData.name}', '${slotData.company}', '${slotData.date}', '${slotData.startTime}', '${slotData.endTime}')">Edit</button>
//                             <button class="btn btn-danger" onclick="deleteSlot('${doc.id}')">Delete</button>
//                         </td>
//                     </tr>
//                 `;
//                 slotTableBody.innerHTML += slotRow;
//             });
//         })
//         .catch((error) => {
//             console.log("Error getting slot data: ", error);
//         });
// }
// Function to fetch and display booked slots
// Function to fetch and display booked slots
function fetchSlots(orderByAscending = true) {
    let query = db.collection("bookings");
    
    // Order by startTime in ascending or descending order
    if (orderByAscending) {
        query = query.orderBy("startTime", "asc");
    } else {
        query = query.orderBy("startTime", "desc");
    }

    query.get()
        .then((querySnapshot) => {
            const slotTableBody = document.getElementById('slot-table-body');
            slotTableBody.innerHTML = ''; // Clear existing rows

            querySnapshot.forEach((doc) => {
                const slotData = doc.data();
                const slotRow = `
                    <tr>
                        <td>${slotData.name}</td>
                        <td>${slotData.company}</td>
                        <td>${slotData.date}</td>
                        <td>${slotData.startTime}</td>
                        <td>${slotData.endTime}</td>
                        <td>${getAMPM(slotData.startTime)} - ${getAMPM(slotData.endTime)}</td>
                        <td>
                            <button class="btn btn-info" onclick="editSlot('${doc.id}', '${slotData.name}', '${slotData.company}', '${slotData.date}', '${slotData.startTime}', '${slotData.endTime}')">Edit</button>
                            <button  class="btn btn-danger"  onclick="deleteSlot('${doc.id}')">Delete</button>
                    
                        </td>
                    </tr>
                `;
                slotTableBody.innerHTML += slotRow;
            });
        })
        .catch((error) => {
            console.log("Error getting slot data: ", error);
        });
}



// Function to edit a slot
function editSlot(slotId, name, company, date, startTime, endTime) {
    // Populate the form fields with existing slot details
    document.getElementById('edit-name').value = name;
    document.getElementById('edit-company').value = company;
    document.getElementById('edit-date').value = date;
    document.getElementById('edit-start-time').value = startTime;
    document.getElementById('edit-end-time').value = endTime;

    // Display the edit form
    document.getElementById('edit-form').style.display = 'block';

    // Save the slot ID for updating later
    document.getElementById('edit-slot-id').value = slotId;
}

// Function to update a slot
function updateSlot() {
    const slotId = document.getElementById('edit-slot-id').value;
    const name = document.getElementById('edit-name').value;
    const company = document.getElementById('edit-company').value;
    const date = document.getElementById('edit-date').value;
    const startTime = document.getElementById('edit-start-time').value;
    const endTime = document.getElementById('edit-end-time').value;

    // Check if the slot overlaps with existing bookings
    db.collection("bookings")
        .where('date', '==', date)
        .where('startTime', '<', endTime)
        .where('endTime', '>', startTime)
        .get()
        .then((querySnapshot) => {
            if (!querySnapshot.empty && querySnapshot.docs.some(doc => doc.id !== slotId)) {
                alert('Slot overlaps with existing booking. Please choose a different time.');
            } else {
                // Update slot details in Firestore
                db.collection("bookings").doc(slotId).update({
                    name: name,
                    company: company,
                    date: date,
                    startTime: startTime,
                    endTime: endTime
                })
                .then(() => {
                    alert("Slot updated successfully!");
                    fetchSlots(); // Refresh the slot table after updating
                    document.getElementById('edit-form').style.display = 'none'; // Hide the edit form
                })
                .catch((error) => {
                    console.error("Error updating slot: ", error);
                });
            }
        })
        .catch((error) => {
            console.log("Error checking existing bookings: ", error);
        });
}
// Function to determine if a time is AM or PM
function getAMPM(timeString) {
    const timeParts = timeString.split(":");
    const hours = parseInt(timeParts[0]);
    const minutes = parseInt(timeParts[1]);
    if (hours < 12) {
        return 'AM';
    } else {
        return 'PM';
    }
}


// Function to delete a slot
function deleteSlot(slotId) {
    db.collection("bookings").doc(slotId).delete()
        .then(() => {
            alert("Slot deleted successfully!");
            fetchSlots(); // Refresh the slot table after deletion
        })
        .catch((error) => {
            console.error("Error deleting slot: ", error);
        });
}

// Function to convert time to 12-hour format
function convertTo12HourFormat(timeString) {
    const [hours24, minutes] = timeString.split(":").map(Number);
    const period = hours24 < 12 ? "AM" : "PM";
    const hours12 = hours24 % 12 || 12;
    return `${hours12}:${minutes.toString().padStart(2, "0")} ${period}`;
}

$(document).ready(function() {
    $(".btn").click(function() {
        $(".form-signin").toggleClass("form-signin-left");
        $(".form-signup").toggleClass("form-signup-left");
        $(".frame").toggleClass("frame-long");
        $(".signup-inactive").toggleClass("signup-active");
        $(".signin-active").toggleClass("signin-inactive");
        $(".forgot").toggleClass("forgot-left");   
        $(this).removeClass("idle").addClass("active");
    });

    $(".btn-signup").click(function() {
        $(".nav").toggleClass("nav-up");
        $(".form-signup-left").toggleClass("form-signup-down");
        $(".success").toggleClass("success-left"); 
        $(".frame").toggleClass("frame-short");
    });

    $(".btn-signin").click(function() {
        $(".btn-animate").toggleClass("btn-animate-grow");
        $(".welcome").toggleClass("welcome-left");
        $(".cover-photo").toggleClass("cover-photo-down");
        $(".frame").toggleClass("frame-short");
        $(".profile-photo").toggleClass("profile-photo-down");
        $(".btn-goback").toggleClass("btn-goback-up");
        $(".forgot").toggleClass("forgot-fade");
    });
});

// Call the fetchSlots function when the page is loaded
window.onload = function() {
    fetchSlots();
};