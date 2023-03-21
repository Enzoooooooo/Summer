document.getElementById('login-form').addEventListener('submit', async (event) => {
    event.preventDefault();

    // Récupérez les données de formulaire (e-mail et mot de passe)
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    // Effectuez une requête POST au serveur pour vérifier les informations de connexion
    const response = await fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    });

    // Si la connexion est réussie, redirigez vers la page dashboard.html
    if (response.ok) {
        // Ajoutez cette ligne pour extraire les données de la réponse
        const data = await response.json();

        // Vérifiez si la connexion est réussie, et stockez l'ID utilisateur dans localStorage
        if (data.message === 'Connexion réussie') {
            localStorage.setItem('userId', data.userId);
            window.location.href = 'main.html';
            console.log(data.userId);
        } else {
            // Affichez un message d'erreur si la connexion échoue
            const errorMessage = document.getElementById('error-message');
            errorMessage.textContent = 'Erreur de connexion. Veuillez vérifier vos identifiants.';
        }
    } else {
        // Affichez un message d'erreur si la connexion échoue
        const errorMessage = document.getElementById('error-message');
        errorMessage.textContent = 'Erreur de connexion. Veuillez vérifier vos identifiants.';
    }
});
