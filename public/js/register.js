// event listener for when the page loads, add an onclick event for the submit button and call the save function
window.addEventListener('load', () => {
    document.getElementById("submit").onclick = save;
});

// function that gets value from input fields, and saves them to the database if the username is not taken
function save(){
    document.getElementById("error").innerHTML = "";
    // get values from input fields and create a new user object
    let name = document.getElementById("name").value;
    let pass = document.getElementById("pass").value;
    let newUser = { username: name, password: pass, accountType: "patron"};
    // send a post request to the server with new user object
    fetch(`/register`, {
        method: 'POST', 
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(newUser)
    })
    .then((response) => {
        // if the username is taken, clear the input fields and display error message
        if (!response.ok) {
            document.getElementById("name").value = '';
            document.getElementById("pass").value = '';
            document.getElementById("error").innerHTML = "That username is taken. Please use a different username.";
        } else {
            // else user has been registered and will be redirected to the home page
            location.href=`http://localhost:3000/`;
        }
    })
    .catch((error) => console.log(error));
}