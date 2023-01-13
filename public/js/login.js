// event listener for when the page loads, add an onclick event for the submit button and call the save function
window.addEventListener('load', () => {
    document.getElementById("submit").onclick = login;
});

// function that gets value from input fields, and attempts to log in the user
function login(){
    document.getElementById("error").innerHTML = "";
    // get values from input fields and create a new user object
    let name = document.getElementById("name").value;
    let pass = document.getElementById("pass").value;
    let user = { username: name, password: pass };
    // send a post request to the server with user object
    fetch(`/login`, {
        method: 'POST', 
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(user)
    })
    .then((response) => {
        // if the username is taken, clear the input fields and display error message
        if (!response.ok) {
            document.getElementById("name").value = '';
            document.getElementById("pass").value = '';
            document.getElementById("error").innerHTML = "Invalid username or password.";
        } else {
            // else user has logged in 
           console.log("Logged in");
           location.href=`http://localhost:3000/`;
        }
    })
    .catch((error) => console.log(error));
}