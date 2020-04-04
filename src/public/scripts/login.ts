import "./webpackVars";


enum LoginRegisterFormOptions {
    LOGIN,
    REGISTER
}

const overrideSubmitForm = (option: LoginRegisterFormOptions, submit = false): void => {
    const loginRegisterForm = document.getElementById("form-login-register") as (null|HTMLFormElement);
    if (loginRegisterForm) {
        if (option === LoginRegisterFormOptions.LOGIN) {
            loginRegisterForm.action = "/api/account/login";
        } else if (option === LoginRegisterFormOptions.REGISTER) {
            loginRegisterForm.action = "/api/account/register";
        }
        // If wanted try to submit the form
        if (submit) {
            // Therefore check first the validity of the form
            if (loginRegisterForm.checkValidity()) {
                // If it is valid submit
                loginRegisterForm.submit();
            } else {
                // If not show default validity warning
                loginRegisterForm.reportValidity();
            }
        }
    }
};


window.addEventListener("load", () => {

    const loginButton = document.getElementById("login-button-login");
    const registerButton = document.getElementById("login-button-register");

    if (loginButton && registerButton) {
        loginButton.addEventListener("click", () => {
            // Set the form to login
            overrideSubmitForm(LoginRegisterFormOptions.LOGIN, true);
        });
        registerButton.addEventListener("click", () => {
            // Set the form to register
            overrideSubmitForm(LoginRegisterFormOptions.REGISTER, true);
        });
    }

});
