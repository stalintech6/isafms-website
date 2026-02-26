function login() {
    var email = document.getElementById("email").value;
    var password = document.getElementById("password").value;

    if(email === "teacher@isafms.com" && password === "1234") {
        window.location.href = "dashboard.html";
    } else {
        alert("Invalid Login");
    }
}
