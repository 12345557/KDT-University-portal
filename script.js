document.addEventListener("DOMContentLoaded", () => {
    const states = {
        IDLE: "idle",
        LOGIN: "login",
        COURSE_REGISTRATION: "course_registration",
        EXAM_ENROLLMENT: "exam_enrollment"
    };

    let currentState = states.IDLE;

    const roleField = document.getElementById("role");
    const regIdField = document.getElementById("idInput");
    const passwordField = document.getElementById("password");
    const loginBtn = document.getElementById("loginBtn");
    const errorMsg = document.getElementById("error-msg");

    // Example passwords (optional hint)
    const examplePasswords = ["donna", "kavya", "tamil"];
    if (document.getElementById("password-hint")) {
        document.getElementById("password-hint").innerText =
            "Example passwords: " + examplePasswords.join(", ");
    }

    loginBtn.addEventListener("click", (e) => {
        e.preventDefault();

        const role = roleField.value.trim();
        const regId = regIdField.value.trim();
        const password = passwordField.value.trim();

        // Role-based ID regex
        const studentPattern = /^RA\d{14}$/; // e.g., RA2311003050404
        const adminPattern = /^EMP\d{4}$/;   // e.g., EMP1000

        // Validation
        if (!role) {
            errorMsg.textContent = "Please select a role.";
            return;
        }
        if (!regId || !password) {
            errorMsg.textContent = "Please enter all required fields.";
            return;
        }
        if (role === "student" && !studentPattern.test(regId)) {
            errorMsg.textContent = "Invalid Registration ID format. (e.g., RA2311003050404)";
            return;
        }
        if (role === "admin" && !adminPattern.test(regId)) {
            errorMsg.textContent = "Invalid Employee ID format. (e.g., EMP1000)";
            return;
        }
        if (password.length < 6) {
            errorMsg.textContent = "Password must be at least 6 characters.";
            return;
        }

        // Clear error and update FSM
        errorMsg.textContent = "";
        currentState = states.LOGIN;
        console.log(`Current State: ${currentState}`);

        // Simulate backend delay
        setTimeout(() => {
            if (role === "student") {
                currentState = states.COURSE_REGISTRATION;
                console.log(`Current State: ${currentState}`);
                window.location.href = `course-enrollment.html?regId=${encodeURIComponent(regId)}`;
            } else if (role === "admin") {
                currentState = states.EXAM_ENROLLMENT;
                console.log(`Current State: ${currentState}`);
                alert("Admin login detected. Redirect to admin dashboard here.");
            } else {
                errorMsg.textContent = "Please select a valid role.";
            }
        }, 800);
    });
});