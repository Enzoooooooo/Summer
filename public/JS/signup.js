document.getElementById('signup-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    const age = document.getElementById('age').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    const response = await fetch('/signup', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({firstName, lastName, age, email, password})
    });// Gérer la réponse du serveur, par exemple:
    if (response.ok) {
        const data = await response.json();
        console.log(data);
    } else {
        console.error('Erreur lors de l\'inscription');
    }
});
