// changes account type, given a username
function changeAccount(username) {
    // send put request to server to update user account type after confirming if they want to change account type
    if (confirm("Are you sure you want to change your account type?")) {
        fetch('/account', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username: username })
        })
        .then((response) => {
            if (!response.ok) {
                console.log("Error changing account type");
            } else {
                location.reload();
            }
        })
    } else {
        return;
    }
}

// submit form when user clicks on add artwork button
function submitForm() {
    document.getElementById("addart").submit();
}