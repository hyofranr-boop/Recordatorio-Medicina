let currentUser = null;
let users = JSON.parse(localStorage.getItem('users')) || {};
let medications = [];

// Elementos del DOM usados en AppMedicamentos.html
const welcomeUser = document.getElementById('welcome-user');
const medNameInput = document.getElementById('med-name');
const medTimeInput = document.getElementById('med-time');
const medList = document.getElementById('medication-list');


// Función común para cargar los datos en la página de la app
function loadAppData() {
    // Verificamos si la URL actual incluye 'AppMedicamentos.html' (respeta mayúsculas/minúsculas)
    if (window.location.pathname.includes('AppMedicamentos.html')) {
        currentUser = localStorage.getItem('currentUser');
        if (!currentUser || !users[currentUser]) {
            // Si no hay sesión válida, redirigir al login (index.html)
            window.location.href = 'index.html'; 
            return;
        }

        if (welcomeUser) welcomeUser.textContent = currentUser;
        
        // Solicitar permiso de notificaciones al entrar a la app
        requestNotificationPermission(); 

        medications = users[currentUser] || [];
        renderMedications();
        
        // Programar alertas al cargar la app
        medications.forEach(scheduleAlert);
    }
}

// --- Funciones de Autenticación (Llamadas por los botones) ---

// Usada en register.html
function registerUser() {
    const usernameInput = document.getElementById('register-username');
    const username = usernameInput.value.trim();
    if (username && !users[username]) {
        users[username] = [];
        localStorage.setItem('users', JSON.stringify(users));
        localStorage.setItem('currentUser', username);
        alert('Usuario registrado con éxito. Redirigiendo a la aplicación...');
        window.location.href = 'AppMedicamentos.html'; // REDIRECCIÓN CORREGIDA
    } else if (users[username]) {
        alert('Ese usuario ya existe.');
    } else {
        alert('Por favor, ingresa un nombre de usuario válido.');
    }
}

// Usada en index.html (Login)
function loginUser() {
    const usernameInput = document.getElementById('login-username');
    const username = usernameInput.value.trim();
    if (username && users[username]) {
        localStorage.setItem('currentUser', username);
        window.location.href = 'AppMedicamentos.html'; // REDIRECCIÓN CORREGIDA
    } else {
        alert('Usuario no encontrado o incorrecto.');
    }
}

// Usada en AppMedicamentos.html para salir
function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html'; // Redirige al login
    // Limpiar temporizadores si se cierran sesión
    notificationTimers.forEach(clearTimeout);
    notificationTimers = [];
}

// --- Funciones de Medicamentos (Solo usadas en AppMedicamentos.html) ---

function addMedication() {
    const name = document.getElementById('med-name').value.trim();
    const time = document.getElementById('med-time').value;

    if (name && time) {
        const now = new Date();
        const newMed = { 
            id: Date.now(), 
            name, 
            time,
            registeredAt: now.toLocaleTimeString()
        };
        medications.push(newMed);
        saveMedications();
        renderMedications();
        scheduleAlert(newMed); 
    }
}

function deleteMedication(id) {
    medications = medications.filter(med => med.id !== id);
    saveMedications();
    renderMedications();
}

function saveMedications() {
    if (currentUser) {
        users[currentUser] = medications;
        localStorage.setItem('users', JSON.stringify(users));
    }
}

function renderMedications() {
    const medList = document.getElementById('medication-list');
    if (!medList) return; // Evita errores si no estamos en AppMedicamentos.html
    medList.innerHTML = '';
    medications.forEach(med => {
        const li = document.createElement('li');
        li.classList.add('list-group-item', 'med-item'); 
        li.innerHTML = `
            <div>
                <strong>${med.name}</strong> (${med.time})<br>
                <small class="text-muted">Registrado: ${med.registeredAt}</small>
            </div>
            <button class="btn btn-danger btn-sm" onclick="deleteMedication(${med.id})">Eliminar</button>
        `;
        medList.appendChild(li);
    });
}

// --- Funciones de Notificación (Requieren permiso del navegador) ---

function requestNotificationPermission() {
    if ("Notification" in window && Notification.permission !== "granted" && Notification.permission !== "denied") {
        Notification.requestPermission();
    }
}

function scheduleAlert(medication) {
    const now = new Date();
    const [hours, minutes] = medication.time.split(':');
    const alertTime = new Date();
    alertTime.setHours(hours, minutes, 0, 0);

    if (alertTime <= now) {
        alertTime.setDate(alertTime.getDate() + 1);
    }

    const timeDiff = alertTime.getTime() - now.getTime();

    if (timeDiff > 0) {
        const timerId = setTimeout(() => {
            showNotification(medication.name, medication.time);
        }, timeDiff);
        
        notificationTimers.push(timerId);
    }
}

function showNotification(name, time) {
    if (Notification.permission === "granted") {
        new Notification('⏰ Recordatorio de Medicamento', {
            body: `Es hora de tomar tu ${name} (a las ${time}).`,
            icon: 'cdn-icons-png.flaticon.com' 
        });
    } else {
        alert(`Recordatorio: Es hora de tomar tu ${name} (a las ${time}).`);
    }
}

// Llama a loadAppData() cuando se carga cualquier página para manejar redirecciones
document.addEventListener('DOMContentLoaded', loadAppData);

function logout() {
    localStorage.removeItem('currentUser'); // Elimina la sesión del navegador
    window.location.href = 'iniciarsesion.html'; // Redirige a la página de iniciar sesión
    // ...
}
