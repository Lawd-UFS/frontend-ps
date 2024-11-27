//função de clique para mostrar e esconder a senha.
const visibilityPassword = () => {
    const password = document.getElementById('password');
    const visibility = document.getElementById('visibility');
    if(password.type == "password"){
        password.type = "text";
        visibility.src = "../images/visibility.png"
    }
    else {
        password.type = "password";
         visibility.src = "../images/visibility_off.png"
    }
}